const User = require("../models/User");
const bcrypt = require("bcryptjs");

describe("User Model", () => {
  describe("User Creation", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it("should hash password before saving", async () => {
      const plainPassword = "password123";
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: plainPassword,
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(plainPassword.length);

      // Verify it's a valid bcrypt hash
      const isValidHash = await bcrypt.compare(plainPassword, user.password);
      expect(isValidHash).toBe(true);
    });

    it("should require username", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should require email", async () => {
      const userData = {
        username: "testuser",
        password: "password123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should require password", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should enforce unique username", async () => {
      const userData1 = {
        username: "testuser",
        email: "test1@example.com",
        password: "password123",
      };

      const userData2 = {
        username: "testuser", // Same username
        email: "test2@example.com",
        password: "password123",
      };

      await User.create(userData1);
      await expect(User.create(userData2)).rejects.toThrow();
    });

    it("should enforce unique email", async () => {
      const userData1 = {
        username: "testuser1",
        email: "test@example.com",
        password: "password123",
      };

      const userData2 = {
        username: "testuser2",
        email: "test@example.com", // Same email
        password: "password123",
      };

      await User.create(userData1);
      await expect(User.create(userData2)).rejects.toThrow();
    });

    it("should enforce minimum password length", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "12345", // Less than 6 characters
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should trim whitespace from username and email", async () => {
      const userData = {
        username: "  testuser  ",
        email: "  TEST@EXAMPLE.COM  ",
        password: "password123",
      };

      const user = await User.create(userData);

      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com"); // Should also be lowercase
    });

    it("should convert email to lowercase", async () => {
      const userData = {
        username: "testuser",
        email: "TEST@EXAMPLE.COM",
        password: "password123",
      };

      const user = await User.create(userData);

      expect(user.email).toBe("test@example.com");
    });
  });

  describe("Password Methods", () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
    });

    describe("comparePassword method", () => {
      it("should return true for correct password", async () => {
        const isMatch = await testUser.comparePassword("password123");
        expect(isMatch).toBe(true);
      });

      it("should return false for incorrect password", async () => {
        const isMatch = await testUser.comparePassword("wrongpassword");
        expect(isMatch).toBe(false);
      });

      it("should handle empty password", async () => {
        const isMatch = await testUser.comparePassword("");
        expect(isMatch).toBe(false);
      });

      it("should handle null password", async () => {
        const isMatch = await testUser.comparePassword(null);
        expect(isMatch).toBe(false);
      });
    });

    describe("Password hashing on update", () => {
      it("should hash password when updated", async () => {
        const newPassword = "newpassword123";
        const oldHashedPassword = testUser.password;

        testUser.password = newPassword;
        await testUser.save();

        expect(testUser.password).not.toBe(newPassword);
        expect(testUser.password).not.toBe(oldHashedPassword);

        const isMatch = await testUser.comparePassword(newPassword);
        expect(isMatch).toBe(true);
      });

      it("should not rehash password if not modified", async () => {
        const originalPassword = testUser.password;

        testUser.username = "updateduser";
        await testUser.save();

        expect(testUser.password).toBe(originalPassword);
      });
    });
  });

  describe("User Queries", () => {
    beforeEach(async () => {
      await User.create([
        {
          username: "alice",
          email: "alice@example.com",
          password: "password123",
        },
        {
          username: "bob",
          email: "bob@example.com",
          password: "password123",
        },
        {
          username: "charlie",
          email: "charlie@example.com",
          password: "password123",
        },
      ]);
    });

    it("should find user by email", async () => {
      const user = await User.findOne({ email: "alice@example.com" });

      expect(user).toBeTruthy();
      expect(user.username).toBe("alice");
      expect(user.email).toBe("alice@example.com");
    });

    it("should find user by username", async () => {
      const user = await User.findOne({ username: "bob" });

      expect(user).toBeTruthy();
      expect(user.username).toBe("bob");
      expect(user.email).toBe("bob@example.com");
    });

    it("should exclude password when selected", async () => {
      const user = await User.findOne({ username: "charlie" }).select(
        "-password"
      );

      expect(user).toBeTruthy();
      expect(user.username).toBe("charlie");
      expect(user.password).toBeUndefined();
    });

    it("should find multiple users", async () => {
      const users = await User.find({})
        .select("username email")
        .sort({ username: 1 });

      expect(users).toHaveLength(3);
      expect(users[0].username).toBe("alice");
      expect(users[1].username).toBe("bob");
      expect(users[2].username).toBe("charlie");

      users.forEach((user) => {
        expect(user.password).toBeUndefined();
      });
    });
  });
});
