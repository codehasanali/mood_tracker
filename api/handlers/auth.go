package handler

import (
	"api/prisma/db"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Register(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz giriş verileri. Lütfen kullanıcı adınızı ve şifrenizi kontrol edin."})
			return
		}

		existingUser, err := client.User.FindUnique(
			db.User.Username.Equals(user.Username),
		).Exec(c)

		if err == nil && existingUser != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Bu kullanıcı adı zaten kullanımda. Lütfen başka bir kullanıcı adı seçin."})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Şifre şifreleme başarısız oldu. Lütfen daha sonra tekrar deneyin."})
			return
		}

		createdUser, err := client.User.CreateOne(
			db.User.Username.Set(user.Username),
			db.User.Password.Set(string(hashedPassword)),
		).Exec(c)

		if err != nil {
			if strings.Contains(err.Error(), "Unique constraint failed on the fields: (`username`)") {
				c.JSON(http.StatusConflict, gin.H{"error": "Bu kullanıcı adı zaten kullanımda. Lütfen başka bir kullanıcı adı seçin."})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Kullanıcı oluşturma başarısız oldu. Lütfen daha sonra tekrar deneyin."})
			}
			return
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": createdUser.ID,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, err := token.SignedString([]byte("hasanali"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Token oluşturma başarısız oldu. Lütfen daha sonra tekrar deneyin."})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": tokenString, "message": "Kullanıcı başarıyla kaydedildi ve giriş yaptı."})
	}
}

func Login(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var loginUser struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&loginUser); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz giriş bilgileri. Lütfen kullanıcı adı ve şifrenizi kontrol edin."})
			return
		}

		user, err := client.User.FindUnique(
			db.User.Username.Equals(loginUser.Username),
		).Exec(c)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Kullanıcı bulunamadı. Lütfen kullanıcı adınızı kontrol edin veya yeni bir hesap oluşturun."})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginUser.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Hatalı şifre. Lütfen şifrenizi kontrol edin ve tekrar deneyin."})
			return
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": user.ID,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, err := token.SignedString([]byte("hasanali"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"hata": "Oturum açma işlemi başarısız oldu. Lütfen daha sonra tekrar deneyin."})
			return
		}
		c.JSON(http.StatusOK, gin.H{"token": tokenString, "mesaj": "Giriş başarılı. Hoş geldiniz!"})
	}
}

func GetUserInfo(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Yetkilendirme başlığı eksik"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("beklenmeyen imza yöntemi: %v", token.Header["alg"])
			}
			return []byte("hasanali"), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz token"})
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			userID := uint(claims["user_id"].(float64))

			user, err := client.User.FindUnique(
				db.User.ID.Equals(int(userID)),
			).Exec(c.Request.Context())

			if err != nil {
				if err == db.ErrNotFound {
					c.JSON(http.StatusNotFound, gin.H{"hata": "Kullanıcı bulunamadı"})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"hata": "Kullanıcı bilgileri alınamadı"})
				}
				return
			}

			c.JSON(http.StatusOK, user)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz token"})
		}
	}
}

func DeleteUser(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Token bulunamadı"})
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte("hasanali"), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz token claims"})
			return
		}

		userID, ok := claims["user_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz kullanıcı kimliği"})
			return
		}

		_, err = client.User.FindUnique(
			db.User.ID.Equals(int(userID)),
		).Delete().Exec(c.Request.Context())

		if err != nil {
			if err == db.ErrNotFound {
				c.JSON(http.StatusNotFound, gin.H{"hata": "Kullanıcı bulunamadı"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"hata": "Kullanıcı silinemedi: " + err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{"mesaj": "Kullanıcı başarıyla silindi"})
	}
}

func UpdateUser(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Token bulunamadı"})
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte("hasanali"), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz token claims"})
			return
		}

		userID, ok := claims["user_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"hata": "Geçersiz kullanıcı kimliği"})
			return
		}

		// Token'dan çıkarılan user_id'yi context'e ekleyelim
		c.Set("user_id", uint(userID))

		var updateData struct {
			Username string `json:"username"`
		}

		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz güncelleme verileri"})
			return
		}

		updatedUser, err := client.User.FindUnique(
			db.User.ID.Equals(int(userID)),
		).Update(
			db.User.Username.SetIfPresent(&updateData.Username),
		).Exec(c.Request.Context())

		if err != nil {
			if err == db.ErrNotFound {
				c.JSON(http.StatusNotFound, gin.H{"hata": "Kullanıcı bulunamadı"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"hata": "Kullanıcı güncellenemedi: " + err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{"mesaj": "Kullanıcı başarıyla güncellendi", "kullanici": updatedUser})
	}
}

func SetAppPassword(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			AppPassword string `json:"appPassword"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz giriş verileri. Lütfen şifrenizi kontrol edin."})
			return
		}

		// Retrieve user ID from context (set by AuthMiddleware)
		userIDInterface, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Kullanıcı kimliği bulunamadı"})
			return
		}
		userID := userIDInterface.(uint)

		// Hash the new app password
		hashedAppPassword, err := bcrypt.GenerateFromPassword([]byte(payload.AppPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Şifre şifreleme başarısız oldu. Lütfen daha sonra tekrar deneyin."})
			return
		}

		_, err = client.User.FindUnique(
			db.User.ID.Equals(int(userID)),
		).Update(
			db.User.AppPassword.Set(string(hashedAppPassword)),
		).Exec(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Uygulama şifresi güncellenemedi. Lütfen daha sonra tekrar deneyin."})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Uygulama şifresi başarıyla güncellendi"})
	}
}

func VerifyAppPassword(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			AppPassword string `json:"appPassword"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz giriş verileri. Lütfen şifrenizi kontrol edin."})
			return
		}

		// Retrieve user ID from context (set by AuthMiddleware)
		userIDInterface, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Kullanıcı kimliği bulunamadı"})
			return
		}
		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Geçersiz kullanıcı kimliği"})
			return
		}

		// Retrieve the user's app password from the database
		user, err := client.User.FindUnique(
			db.User.ID.Equals(int(userID)),
		).Exec(c.Request.Context())
		if err != nil {
			if err == db.ErrNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Kullanıcı bulunamadı"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Kullanıcı bilgileri alınamadı: " + err.Error()})
			}
			return
		}

		appPassword, ok := user.AppPassword()
		if !ok || appPassword == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Uygulama şifresi ayarlanmadı"})
			return
		}
		if err := bcrypt.CompareHashAndPassword([]byte(appPassword), []byte(payload.AppPassword)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Geçersiz uygulama şifresi"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Uygulama şifresi doğrulandı"})
	}
}

func CheckAppPasswordSet(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDInterface, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Kullanıcı kimliği bulunamadı"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Geçersiz kullanıcı kimliği"})
			return
		}

		// Retrieve the user's app password from the database
		user, err := client.User.FindUnique(
			db.User.ID.Equals(int(userID)),
		).Exec(c)
		if err != nil {
			if err == db.ErrNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Kullanıcı bulunamadı"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Kullanıcı bilgileri alınamadı: " + err.Error()})
			}
			return
		}

		appPassword, ok := user.AppPassword()
		if !ok {
			c.JSON(http.StatusOK, gin.H{"isSet": false})
			return
		}

		isSet := appPassword != ""

		c.JSON(http.StatusOK, gin.H{"isSet": isSet})
	}
}
