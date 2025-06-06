const request = require("supertest");
const app = require("../index");

describe("User", () => {
  describe("POST /api/users/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Valambi Test",
        email: "valambi@example.com",
        password: "password123",
        country: "Ghana",
      };

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty(
        "message",
        "Utilisateur créé avec succès"
      );
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.user.name).toBe(userData.name);
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("should return validation error for missing required fields", async () => {
      const userData = {
        email: "test@example.com",
        // Missing name, password, and country
      };

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
      expect(res.body.message).toContain("Validation échouée");
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "duplicate@example.com",
        password: "password123",
        country: "Ghana",
      };

      // Create first user
      await request(app).post("/api/users/register").send(userData);

      // Try to create second user with same email
      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty("status", "error");
      expect(res.body.message).toContain("email existe déjà");
    });

    it("should return error for invalid email format", async () => {
      const userData = {
        name: "Test User",
        email: "invalid-email",
        password: "password123",
        country: "Ghana",
      };

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
      expect(res.body.message).toContain("Email invalide");
    });

    it("should return error for short password", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "123", // Too short
        country: "Ghana",
      };

      const res = await request(app).post("/api/users/register").send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
      expect(res.body.message).toContain("Mot de passe trop court");
    });
  });

  //   describe("POST /api/users/login", () => {
  //     beforeEach(async () => {
  //       // Create a test user before each login test
  //       await request(app).post("/api/users/register").send({
  //         name: "Login Test User",
  //         email: "login@example.com",
  //         password: "password123",
  //         country: "Ghana",
  //       });
  //     });

  //     it("should login successfully with valid credentials", async () => {
  //       const loginData = {
  //         email: "login@example.com",
  //         password: "password123",
  //       };

  //       const res = await request(app).post("/api/users/login").send(loginData);

  //       expect(res.statusCode).toBe(200);
  //       expect(res.body).toHaveProperty("message", "Connexion réussie");
  //       expect(res.body).toHaveProperty("data");
  //       expect(res.body.data).toHaveProperty("user");
  //       expect(res.body.data).toHaveProperty("token");
  //       expect(res.body.data).toHaveProperty("refreshToken");
  //       expect(res.body.data.user.email).toBe(loginData.email);
  //     });

  //     it("should return error for invalid email", async () => {
  //       const loginData = {
  //         email: "nonexistent@example.com",
  //         password: "password123",
  //       };

  //       const res = await request(app).post("/api/users/login").send(loginData);

  //       expect(res.statusCode).toBe(401);
  //       expect(res.body).toHaveProperty("status", "error");
  //     });

  //     it("should return error for invalid password", async () => {
  //       const loginData = {
  //         email: "login@example.com",
  //         password: "wrongpassword",
  //       };

  //       const res = await request(app).post("/api/users/login").send(loginData);

  //       expect(res.statusCode).toBe(401);
  //       expect(res.body).toHaveProperty("status", "error");
  //     });

  //     it("should return validation error for missing fields", async () => {
  //       const loginData = {
  //         email: "login@example.com",
  //         // Missing password
  //       };

  //       const res = await request(app).post("/api/users/login").send(loginData);

  //       expect(res.statusCode).toBe(400);
  //       expect(res.body).toHaveProperty("status", "error");
  //       expect(res.body.message).toContain("Validation échouée");
  //     });
  //   });

  //   describe("GET /api/users/profile", () => {
  //     let authToken;
  //     let userId;

  //     beforeEach(async () => {
  //       // Register and login to get auth token
  //       const registerRes = await request(app).post("/api/users/register").send({
  //         name: "Profile Test User",
  //         email: "profile@example.com",
  //         password: "password123",
  //         country: "Ghana",
  //       });

  //       authToken = registerRes.body.data.token;
  //       userId = registerRes.body.data.user._id;
  //     });

  //     it("should get user profile with valid token", async () => {
  //       const res = await request(app)
  //         .get("/api/users/profile")
  //         .set("Authorization", `Bearer ${authToken}`);

  //       expect(res.statusCode).toBe(200);
  //       expect(res.body).toHaveProperty("message", "Profil récupéré avec succès");
  //       expect(res.body).toHaveProperty("data");
  //       expect(res.body.data.email).toBe("profile@example.com");
  //       expect(res.body.data).not.toHaveProperty("password");
  //     });

  //     it("should return error without auth token", async () => {
  //       const res = await request(app).get("/api/users/profile");

  //       expect(res.statusCode).toBe(401);
  //       expect(res.body).toHaveProperty("status", "error");
  //       expect(res.body.message).toContain("Token d'authentification manquant");
  //     });

  //     it("should return error with invalid token", async () => {
  //       const res = await request(app)
  //         .get("/api/users/profile")
  //         .set("Authorization", "Bearer invalid-token");

  //       expect(res.statusCode).toBe(401);
  //       expect(res.body).toHaveProperty("status", "error");
  //       expect(res.body.message).toContain("Token d'authentification invalide");
  //     });
  //   });

  //   describe("PUT /api/users/social-profile", () => {
  //     let authToken;

  //     beforeEach(async () => {
  //       const registerRes = await request(app).post("/api/users/register").send({
  //         name: "Social Profile Test User",
  //         email: "social@example.com",
  //         password: "password123",
  //         country: "Ghana",
  //       });

  //       authToken = registerRes.body.data.token;
  //     });

  //     it("should update social profile successfully", async () => {
  //       const updateData = {
  //         bio: "Updated bio for testing",
  //         visibility: "public",
  //         socialLinks: [
  //           {
  //             platform: "twitter",
  //             url: "https://twitter.com/testuser",
  //           },
  //         ],
  //       };

  //       const res = await request(app)
  //         .put("/api/users/social-profile")
  //         .set("Authorization", `Bearer ${authToken}`)
  //         .send(updateData);

  //       expect(res.statusCode).toBe(200);
  //       expect(res.body).toHaveProperty("message", "Profil social mis à jour");
  //       expect(res.body).toHaveProperty("data");
  //     });

  //     it("should return validation error for invalid visibility", async () => {
  //       const updateData = {
  //         bio: "Test bio",
  //         visibility: "invalid-visibility", // Invalid value
  //       };

  //       const res = await request(app)
  //         .put("/api/users/social-profile")
  //         .set("Authorization", `Bearer ${authToken}`)
  //         .send(updateData);

  //       expect(res.statusCode).toBe(400);
  //       expect(res.body).toHaveProperty("status", "error");
  //       expect(res.body.message).toContain("Validation échouée");
  //     });
  //   });

  //   describe("POST /api/users/refresh-token", () => {
  //     let refreshToken;

  //     beforeEach(async () => {
  //       const loginRes = await request(app).post("/api/users/register").send({
  //         name: "Refresh Test User",
  //         email: "refresh@example.com",
  //         password: "password123",
  //         country: "Ghana",
  //       });

  //       refreshToken = loginRes.body.data.token; // In real app, this would be the refresh token
  //     });

  //     it("should refresh token successfully", async () => {
  //       const res = await request(app)
  //         .post("/api/users/refresh-token")
  //         .send({ refreshToken });

  //       expect(res.statusCode).toBe(200);
  //       expect(res.body).toHaveProperty("message", "Token rafraîchi avec succès");
  //       expect(res.body).toHaveProperty("data");
  //       expect(res.body.data).toHaveProperty("token");
  //     });

  //     it("should return error for missing refresh token", async () => {
  //       const res = await request(app).post("/api/users/refresh-token").send({});

  //       expect(res.statusCode).toBe(400);
  //       expect(res.body).toHaveProperty("status", "error");
  //       expect(res.body.message).toContain("Validation échouée");
  //     });
  //   });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("uptime");
    });
  });
});
