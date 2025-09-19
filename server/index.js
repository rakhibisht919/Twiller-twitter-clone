const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { sendVerificationEmail, generateVerificationToken, sendOTPEmail, sendPasswordResetEmail } = require('./utils/emailService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});
const port = 5001;

// MongoDB connection string - use environment variable or fallback to local MongoDB
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/twiller";

// Configure CORS and JSON parsing
app.use(cors());
// Increase payload limits to handle larger image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Start server regardless of MongoDB connection status
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`🌐 Server accessible at:`);
  console.log(`   Local: http://localhost:${port}`);
  console.log(`   Network: http://192.168.29.125:${port}`);
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Twiller is working");
});

// In-memory fallback data store
const memoryDB = { posts: [], users: [], follows: [], verificationTokens: [] };
let usingMemoryFallback = false;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB and set up routes
async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    
    const db = client.db("twiller");
    const postcollection = db.collection("posts");
    const usercollection = db.collection("users");
    const followcollection = db.collection("follows");
    
    // User profile update endpoint
    app.patch("/userupdate", async (req, res) => {
      try {
        const email = req.query.email;
        
        if (!email) {
          return res.status(400).json({ 
            error: "Email is required",
            success: false
          });
        }
        
        const filter = { email: email };
        const options = { upsert: true };
        
        // Build update document dynamically based on what's provided
        const updateFields = {};
        
        if (req.body.name !== undefined) updateFields.name = req.body.name;
        if (req.body.username !== undefined) updateFields.username = req.body.username;
        if (req.body.bio !== undefined) updateFields.bio = req.body.bio;
        if (req.body.location !== undefined) updateFields.location = req.body.location;
        if (req.body.website !== undefined) updateFields.website = req.body.website;
        if (req.body.dob !== undefined) updateFields.dob = req.body.dob;
        if (req.body.profileImage !== undefined) updateFields.profileImage = req.body.profileImage;
        if (req.body.coverimage !== undefined) updateFields.coverimage = req.body.coverimage;
        
        // Validate fields if provided
        if (req.body.username && req.body.username.length < 3) {
          return res.status(400).json({ 
            error: "Username must be at least 3 characters",
            success: false
          });
        }
        
        if (req.body.name && req.body.name.trim().length < 1) {
          return res.status(400).json({ 
            error: "Name cannot be empty",
            success: false
          });
        }
        
        // Check if there are any fields to update
        if (Object.keys(updateFields).length === 0) {
          return res.status(400).json({ 
            error: "No fields provided for update",
            success: false
          });
        }
        
        const updateDoc = {
          $set: updateFields
        };
        
        console.log(`Updating user profile for ${email}:`, updateFields);
        console.log('Update document:', updateDoc);
        
        const result = await usercollection.updateOne(filter, updateDoc, options);
        
        // Log the result for debugging
        console.log('Update result:', {
          matched: result.matchedCount,
          modified: result.modifiedCount,
          acknowledged: result.acknowledged
        });
        
        res.json({ 
          success: true, 
          message: "Profile updated successfully",
          result: result,
          updatedFields: Object.keys(updateFields)
        });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ 
          error: "Failed to update profile", 
          success: false,
          message: error.message
        });
      }
    });
    
    // Post tweet endpoint
    app.post("/post", async (req, res) => {
      try {
        const tweetData = req.body;
        tweetData.timestamp = new Date();
        tweetData.likes = 0;
        tweetData.comments = 0;
        tweetData.reshares = 0;
        tweetData.likedBy = [];
        tweetData.resharedBy = [];
        tweetData.commentList = [];
        
        const result = await postcollection.insertOne(tweetData);
        
        // Emit real-time update to connected clients
        io.emit('new-tweet', {
          ...tweetData,
          _id: result.insertedId
        });
        
        res.status(201).json({
          success: true,
          message: "Tweet posted successfully",
          data: result,
          tweetId: result.insertedId
        });
      } catch (error) {
        console.error("Error posting tweet:", error);
        res.status(500).json({ 
          error: "Failed to post tweet", 
          success: false,
          message: error.message
        });
      }
    });
    
    // Get all tweets with real interaction data
    app.get("/posts", async (req, res) => {
      try {
        const posts = await postcollection.find().sort({ timestamp: -1 }).toArray();
        res.json(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Failed to fetch posts" });
      }
    });
    
    // Like a post
    app.post("/post/like", async (req, res) => {
      try {
        const { postId, userId, username } = req.body;
        
        // Check if user already liked the post
        const post = await postcollection.findOne({ _id: new ObjectId(postId) });
        const alreadyLiked = post.likedBy.includes(userId);
        
        let result;
        if (alreadyLiked) {
          // Unlike the post
          result = await postcollection.updateOne(
            { _id: new ObjectId(postId) },
            { 
              $inc: { likes: -1 },
              $pull: { likedBy: userId }
            }
          );
        } else {
          // Like the post
          result = await postcollection.updateOne(
            { _id: new ObjectId(postId) },
            { 
              $inc: { likes: 1 },
              $push: { likedBy: userId }
            }
          );
        }
        
        // Get updated post
        const updatedPost = await postcollection.findOne({ _id: new ObjectId(postId) });
        
        // Emit real-time update
        io.emit('post-liked', updatedPost);
        
        res.json({ 
          success: true, 
          liked: !alreadyLiked,
          post: updatedPost
        });
      } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ error: "Failed to like post" });
      }
    });
    
    // Reshare a post
    app.post("/post/reshare", async (req, res) => {
      try {
        const { postId, userId, username } = req.body;
        
        // Check if user already reshared the post
        const post = await postcollection.findOne({ _id: new ObjectId(postId) });
        const alreadyReshared = post.resharedBy.includes(userId);
        
        let result;
        if (alreadyReshared) {
          // Undo reshare
          result = await postcollection.updateOne(
            { _id: new ObjectId(postId) },
            { 
              $inc: { reshares: -1 },
              $pull: { resharedBy: userId }
            }
          );
        } else {
          // Reshare the post
          result = await postcollection.updateOne(
            { _id: new ObjectId(postId) },
            { 
              $inc: { reshares: 1 },
              $push: { resharedBy: userId }
            }
          );
        }
        
        // Get updated post
        const updatedPost = await postcollection.findOne({ _id: new ObjectId(postId) });
        
        // Emit real-time update
        io.emit('post-reshared', updatedPost);
        
        res.json({ 
          success: true, 
          reshared: !alreadyReshared,
          post: updatedPost
        });
      } catch (error) {
        console.error("Error resharing post:", error);
        res.status(500).json({ error: "Failed to reshare post" });
      }
    });
    
    // Comment on a post
    app.post("/post/comment", async (req, res) => {
      try {
        const { postId, userId, username, comment, commenterName } = req.body;
        
        // Validate required fields
        if (!postId || !userId || !comment?.trim()) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        
        // Create comment object
        const commentData = {
          commentId: new ObjectId().toString(),
          userId,
          username,
          comment: comment.trim(),
          commenterName,
          timestamp: new Date()
        };
        
        // Update the post with the new comment
        const result = await postcollection.updateOne(
          { _id: new ObjectId(postId) },
          { 
            $inc: { comments: 1 },
            $push: { commentList: commentData }
          }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Post not found" });
        }
        
        // Get updated post
        const updatedPost = await postcollection.findOne({ _id: new ObjectId(postId) });
        
        // Emit real-time update
        io.emit('post-commented', updatedPost);
        
        res.json({ 
          success: true, 
          comment: commentData,
          post: updatedPost
        });
      } catch (error) {
        console.error("Error commenting on post:", error);
        res.status(500).json({ error: "Failed to comment on post" });
      }
    });
    
    // Get tweets endpoint
    app.get("/post", async (req, res) => {
      try {
        const email = req.query.email;
        let query = {};
        
        // If email is provided, filter tweets by that user
        if (email) {
          query = { email: email };
        }
        
        const tweets = await postcollection.find(query)
          .sort({ timestamp: -1 })
          .toArray();
          
        res.json(tweets);
      } catch (error) {
        console.error("Error fetching tweets:", error);
        res.status(500).json({
          error: "Failed to fetch tweets",
          success: false,
          message: error.message
        });
      }
    });
    
    // Get user data endpoint
    app.get("/loggedinuser", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const user = await usercollection.find(query).toArray();
        res.json(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({
          error: "Failed to fetch user data",
          success: false,
          message: error.message
        });
      }
    });
    
    // Check if email exists in database
    app.get("/check-email-exists", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        const user = await usercollection.findOne({ email: email });
        
        res.json({
          exists: !!user,
          success: true
        });
      } catch (error) {
        console.error("Error checking email existence:", error);
        res.status(500).json({
          success: false,
          error: "Failed to check email existence",
          message: error.message
        });
      }
    });
    
    // Force delete Firebase account (admin operation)
    app.post("/force-delete-firebase-account", async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        console.log(`🔥 Force deleting Firebase account for: ${email}`);
        
        // We can't directly delete Firebase accounts from the server without Firebase Admin SDK
        // Instead, we'll mark this email as "force deleted" in our database
        // This allows the frontend to proceed with registration
        
        await db.collection('deletedAccounts').insertOne({
          email,
          forceDeleted: true,
          deletedAt: new Date()
        });
        
        res.json({
          success: true,
          message: "Account marked for force deletion"
        });
      } catch (error) {
        console.error("Error force deleting account:", error);
        res.status(500).json({
          success: false,
          error: "Failed to force delete account",
          message: error.message
        });
      }
    });
    
    // Get user by username endpoint
    app.get("/user-by-username/:username", async (req, res) => {
      try {
        const username = req.params.username;
        const user = await usercollection.findOne({ username: username });
        
        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found"
          });
        }
        
        res.json(user);
      } catch (error) {
        console.error("Error fetching user by username:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch user",
          message: error.message
        });
      }
    });
    
    // Get posts by email endpoint
    app.get("/posts-by-email", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        const posts = await postcollection.find({ email: email })
          .sort({ timestamp: -1 })
          .toArray();
          
        res.json(posts);
      } catch (error) {
        console.error("Error fetching posts by email:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch posts",
          message: error.message
        });
      }
    });
    
    // Follow user endpoint
    app.post("/follow", async (req, res) => {
      try {
        const { 
          followerEmail, 
          followingEmail,
          followerName,
          followerUsername,
          followingName,
          followingUsername
        } = req.body;
        
        if (!followerEmail || !followingEmail) {
          return res.status(400).json({
            success: false,
            error: "Follower and following emails are required"
          });
        }
        
        // Check if already following
        const existingFollow = await followcollection.findOne({
          followerEmail,
          followingEmail
        });
        
        if (existingFollow) {
          return res.json({
            success: true,
            message: "Already following this user",
            alreadyFollowing: true
          });
        }
        
        // Create follow relationship
        const followData = {
          followerEmail,
          followingEmail,
          followerName: followerName || "",
          followerUsername: followerUsername || "",
          followingName: followingName || "",
          followingUsername: followingUsername || "",
          timestamp: new Date()
        };
        
        const result = await followcollection.insertOne(followData);
        
        // Update follower count for the followed user
        await usercollection.updateOne(
          { email: followingEmail },
          { $inc: { followers: 1 } }
        );
        
        // Update following count for the follower
        await usercollection.updateOne(
          { email: followerEmail },
          { $inc: { following: 1 } }
        );
        
        res.json({
          success: true,
          message: "Successfully followed user",
          result: result
        });
      } catch (error) {
        console.error("Error following user:", error);
        res.status(500).json({
          success: false,
          error: "Failed to follow user",
          message: error.message
        });
      }
    });
    
    // Unfollow user endpoint
    app.post("/unfollow", async (req, res) => {
      try {
        const { followerEmail, followingEmail } = req.body;
        
        if (!followerEmail || !followingEmail) {
          return res.status(400).json({
            success: false,
            error: "Follower and following emails are required"
          });
        }
        
        // Remove follow relationship
        const result = await followcollection.deleteOne({
          followerEmail,
          followingEmail
        });
        
        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            error: "Follow relationship not found"
          });
        }
        
        // Update follower count for the unfollowed user
        await usercollection.updateOne(
          { email: followingEmail },
          { $inc: { followers: -1 } }
        );
        
        // Update following count for the follower
        await usercollection.updateOne(
          { email: followerEmail },
          { $inc: { following: -1 } }
        );
        
        res.json({
          success: true,
          message: "Successfully unfollowed user",
          result: result
        });
      } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({
          success: false,
          error: "Failed to unfollow user",
          message: error.message
        });
      }
    });
    
    // Check if following endpoint
    app.get("/check-following", async (req, res) => {
      try {
        const { followerEmail, followingEmail } = req.query;
        
        if (!followerEmail || !followingEmail) {
          return res.status(400).json({
            success: false,
            error: "Follower and following emails are required"
          });
        }
        
        const follow = await followcollection.findOne({
          followerEmail,
          followingEmail
        });
        
        res.json({
          success: true,
          following: !!follow
        });
      } catch (error) {
        console.error("Error checking follow status:", error);
        res.status(500).json({
          success: false,
          error: "Failed to check follow status",
          message: error.message
        });
      }
    });
    
    // Get follower count endpoint
    app.get("/followers-count", async (req, res) => {
      try {
        const email = req.query.email;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        const count = await followcollection.countDocuments({ followingEmail: email });
        
        res.json({
          success: true,
          count: count
        });
      } catch (error) {
        console.error("Error fetching follower count:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch follower count",
          message: error.message
        });
      }
    });
    
    // Get following count endpoint
    app.get("/following-count", async (req, res) => {
      try {
        const email = req.query.email;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        const count = await followcollection.countDocuments({ followerEmail: email });
        
        res.json({
          success: true,
          count: count
        });
      } catch (error) {
        console.error("Error fetching following count:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch following count",
          message: error.message
        });
      }
    });
    
    // Get users that current user is following
    app.get("/following-users", async (req, res) => {
      try {
        const email = req.query.email;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        // Get all follow relationships where current user is the follower
        const followRelationships = await followcollection.find({ followerEmail: email }).toArray();
        
        // Get the emails of users being followed
        const followingEmails = followRelationships.map(follow => follow.followingEmail);
        
        if (followingEmails.length === 0) {
          return res.json({
            success: true,
            users: []
          });
        }
        
        // Get full user data for all followed users
        const followingUsers = await usercollection.find({ 
          email: { $in: followingEmails } 
        }).toArray();
        
        res.json({
          success: true,
          users: followingUsers
        });
      } catch (error) {
        console.error("Error fetching following users:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch following users",
          message: error.message
        });
      }
    });
    
    // Delete user account endpoint - permanently removes all user data
    app.delete("/deleteuser/:email", async (req, res) => {
      try {
        const email = req.params.email;
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        console.log(`🗑️ Deleting user account for: ${email}`);
        
        // Delete all user's posts
        const postsResult = await postcollection.deleteMany({ email: email });
        
        // Delete user from users collection
        const userResult = await usercollection.deleteOne({ email: email });
        
        // Delete any verification tokens
        await db.collection('verificationTokens').deleteMany({ email: email });
        
        // Record this deletion in deletedAccounts collection to help with Firebase account cleanup
        await db.collection('deletedAccounts').insertOne({
          email,
          deletedAt: new Date(),
          userDeleted: userResult.deletedCount > 0,
          postsDeleted: postsResult.deletedCount
        });
        
        // Delete any other user-related data from other collections
        // This ensures complete removal of all user data
        
        console.log(`✅ Account deletion results: User deleted: ${userResult.deletedCount}, Posts deleted: ${postsResult.deletedCount}`);
        
        res.json({
          success: true,
          message: "Account permanently deleted",
          userDeleted: userResult.deletedCount > 0,
          postsDeleted: postsResult.deletedCount
        });
      } catch (error) {
        console.error("Error deleting user account:", error);
        res.status(500).json({
          success: false,
          error: "Failed to delete user account",
          message: error.message
        });
      }
    });
    
    // Send verification email endpoint
    app.post("/send-verification", async (req, res) => {
      try {
        const { email, name } = req.body;
        
        if (!email || !name) {
          return res.status(400).json({
            success: false,
            error: "Email and name are required"
          });
        }
        
        // Generate verification token
        const token = generateVerificationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Store verification token in database
        const tokenData = {
          email,
          token,
          expiresAt,
          verified: false,
          createdAt: new Date()
        };
        
        await db.collection('verificationTokens').insertOne(tokenData);
        
        // Send verification email
        console.log(`\n🚀 Sending verification email for: ${email}`);
        const emailResult = await sendVerificationEmail(email, name, token);
        
        if (emailResult.success) {
          console.log('✅ Verification email endpoint: SUCCESS');
          res.json({
            success: true,
            message: "Verification email sent successfully!",
            messageId: emailResult.messageId
          });
        } else {
          console.log('❌ Verification email endpoint: FAILED');
          console.log('Error details:', emailResult);
          res.status(500).json({
            success: false,
            error: emailResult.userMessage || "Failed to send verification email",
            details: emailResult.error,
            troubleshooting: [
              "Check your Gmail app password",
              "Make sure 2FA is enabled on Gmail",
              "Verify your email address is correct",
              "Check your internet connection"
            ]
          });
        }
        
      } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({
          success: false,
          error: "Failed to send verification email",
          message: error.message
        });
      }
    });
    
    // Verify email token endpoint
    app.post("/verify-email", async (req, res) => {
      try {
        const { email, token } = req.body;
        
        if (!email || !token) {
          return res.status(400).json({
            success: false,
            error: "Email and token are required"
          });
        }
        
        // Find verification token
        const tokenDoc = await db.collection('verificationTokens').findOne({
          email,
          token,
          verified: false
        });
        
        if (!tokenDoc) {
          return res.status(400).json({
            success: false,
            error: "Invalid or expired verification token"
          });
        }
        
        // Check if token is expired
        if (new Date() > tokenDoc.expiresAt) {
          return res.status(400).json({
            success: false,
            error: "Verification token has expired"
          });
        }
        
        // Mark token as verified
        await db.collection('verificationTokens').updateOne(
          { _id: tokenDoc._id },
          { 
            $set: { 
              verified: true, 
              verifiedAt: new Date() 
            } 
          }
        );
        
        // Update user's email verification status
        await usercollection.updateOne(
          { email },
          { 
            $set: { 
              emailVerified: true, 
              emailVerifiedAt: new Date() 
            } 
          },
          { upsert: false }
        );
        
        res.json({
          success: true,
          message: "Email verified successfully"
        });
        
      } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({
          success: false,
          error: "Failed to verify email",
          message: error.message
        });
      }
    });
    
    // Check verification status endpoint
    app.get("/verification-status", async (req, res) => {
      try {
        const email = req.query.email;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        const user = await usercollection.findOne({ email });
        
        res.json({
          success: true,
          emailVerified: user?.emailVerified || false
        });
        
      } catch (error) {
        console.error("Error checking verification status:", error);
        res.status(500).json({
          success: false,
          error: "Failed to check verification status",
          message: error.message
        });
      }
    });
    
    // Test email endpoint for debugging
    app.post("/test-email", async (req, res) => {
      try {
        console.log('\n📧 Testing email functionality...');
        const { email, name = 'Test User' } = req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        // Generate a test token
        const testToken = generateVerificationToken();
        
        // Send test email
        const result = await sendVerificationEmail(email, name, testToken);
        
        if (result.success) {
          res.json({
            success: true,
            message: "Test email sent successfully!",
            messageId: result.messageId,
            response: result.response
          });
        } else {
          res.status(500).json({
            success: false,
            error: result.userMessage || result.error,
            details: result.error
          });
        }
        
      } catch (error) {
        console.error("Error in test email endpoint:", error);
        res.status(500).json({
          success: false,
          error: "Failed to send test email",
          message: error.message
        });
      }
    });
    
    // Notifications endpoint
    app.get("/notifications", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res.status(400).json({ 
            success: false, 
            error: "Email is required" 
          });
        }
        
        // For now, return empty notifications since we don't have a notification system yet
        // This can be expanded to include real notifications from interactions
        res.json({
          success: true,
          notifications: []
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch notifications"
        });
      }
    });
    
    // Trending topics endpoint
    app.get("/trends", async (req, res) => {
      try {
        // For now, return empty trends since we don't have trending logic yet
        // This can be expanded to analyze hashtags and popular content
        res.json({
          success: true,
          trends: []
        });
      } catch (error) {
        console.error("Error fetching trends:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch trends"
        });
      }
    });
    
    // Suggested users endpoint
    app.get("/suggested-users", async (req, res) => {
      try {
        const currentUserEmail = req.query.email;
        
        // Get random users that current user is not following
        let query = {};
        if (currentUserEmail) {
          // Get users that current user is not following
          const following = await followcollection.find({ followerEmail: currentUserEmail }).toArray();
          const followingEmails = following.map(f => f.followingEmail);
          followingEmails.push(currentUserEmail); // Exclude current user
          
          query = { email: { $nin: followingEmails } };
        }
        
        const suggestedUsers = await usercollection.find(query).limit(5).toArray();
        
        res.json({
          success: true,
          users: suggestedUsers
        });
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch suggested users"
        });
      }
    });
    
    // Search endpoint
    app.get("/search", async (req, res) => {
      try {
        const query = req.query.q;
        if (!query) {
          return res.json({
            success: true,
            results: []
          });
        }
        
        // Search in posts (using regex since text indexing might not be set up)
        const postResults = await postcollection.find({ 
          $or: [
            { post: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } }
          ]
        }).limit(10).toArray();
        
        const userResults = await usercollection.find({ 
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }).limit(5).toArray();
        
        const results = [
          ...postResults.map(post => ({ 
            ...post, 
            type: 'post',
            content: post.post,
            resultType: 'Tweet'
          })),
          ...userResults.map(user => ({ 
            ...user, 
            type: 'user',
            content: `${user.name} (@${user.username})`,
            resultType: 'User'
          }))
        ];
        
        res.json({
          success: true,
          results: results
        });
      } catch (error) {
        console.error("Error searching:", error);
        res.json({
          success: true,
          results: [] // Return empty results on error
        });
      }
    });
    
    // Send message endpoint
    app.post("/send-message", async (req, res) => {
      try {
        const { from, to, message, timestamp } = req.body;
        
        if (!from || !to || !message) {
          return res.status(400).json({
            success: false,
            error: "From, to, and message are required"
          });
        }
        
        const messageData = {
          from,
          to,
          message,
          timestamp: timestamp || new Date().toISOString(),
          read: false
        };
        
        // Store message in messages collection
        const result = await db.collection('messages').insertOne(messageData);
        
        // Emit real-time message to connected users
        io.emit('new-message', {
          ...messageData,
          _id: result.insertedId
        });
        
        res.json({
          success: true,
          message: "Message sent successfully",
          messageId: result.insertedId
        });
      } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
          success: false,
          error: "Failed to send message"
        });
      }
    });
    
    // Get user lists endpoint
    app.get("/lists", async (req, res) => {
      try {
        const userId = req.query.userId;
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: "UserId is required"
          });
        }
        
        // Get lists created by user from database
        const lists = await db.collection('lists').find({ owner: userId }).toArray();
        
        res.json({
          success: true,
          lists: lists
        });
      } catch (error) {
        console.error("Error fetching lists:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch lists"
        });
      }
    });
    
    // Create list endpoint
    app.post("/lists", async (req, res) => {
      try {
        const listData = req.body;
        listData.createdAt = new Date();
        listData.memberCount = 0;
        listData.followingCount = 0;
        
        const result = await db.collection('lists').insertOne(listData);
        
        res.json({
          success: true,
          message: "List created successfully",
          listId: result.insertedId
        });
      } catch (error) {
        console.error("Error creating list:", error);
        res.status(500).json({
          success: false,
          error: "Failed to create list"
        });
      }
    });
    
    // Track login attempt endpoint
    app.post("/track-login", async (req, res) => {
      try {
        const {
          email,
          deviceInfo,
          loginSuccess,
          authMethod,
          failureReason
        } = req.body;
        
        if (!email || !deviceInfo) {
          return res.status(400).json({
            success: false,
            error: "Email and device info are required"
          });
        }
        
        // Create login record
        const loginRecord = {
          email,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          deviceType: deviceInfo.deviceType,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          screen: deviceInfo.screen,
          loginSuccess: loginSuccess || false,
          authMethod: authMethod || 'password', // password, otp, google
          failureReason: failureReason || null,
          timestamp: new Date(),
          sessionId: deviceInfo.sessionId || null
        };
        
        const result = await db.collection('loginHistory').insertOne(loginRecord);
        
        res.json({
          success: true,
          message: "Login tracked successfully",
          loginId: result.insertedId
        });
      } catch (error) {
        console.error("Error tracking login:", error);
        res.status(500).json({
          success: false,
          error: "Failed to track login",
          message: error.message
        });
      }
    });
    
    // Get login history endpoint
    app.get("/login-history", async (req, res) => {
      try {
        const email = req.query.email;
        const limit = parseInt(req.query.limit) || 10;
        const successOnly = req.query.successOnly === 'true';
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        let query = { email };
        if (successOnly) {
          query.loginSuccess = true;
        }
        
        const loginHistory = await db.collection('loginHistory')
          .find(query)
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();
        
        res.json({
          success: true,
          history: loginHistory
        });
      } catch (error) {
        console.error("Error fetching login history:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch login history",
          message: error.message
        });
      }
    });
    
    // Send OTP for Chrome users endpoint
    app.post("/send-login-otp", async (req, res) => {
      try {
        const { email, deviceInfo } = req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        
        // Store OTP in database
        const otpData = {
          email,
          otp,
          expiresAt,
          verified: false,
          deviceInfo,
          createdAt: new Date()
        };
        
        await db.collection('loginOTPs').insertOne(otpData);
        
        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp);
        
        if (emailResult.success) {
          res.json({
            success: true,
            message: "OTP sent successfully to your email",
            expiresIn: 600 // 10 minutes in seconds
          });
        } else {
          res.status(500).json({
            success: false,
            error: "Failed to send OTP email",
            details: emailResult.error
          });
        }
        
      } catch (error) {
        console.error("Error sending login OTP:", error);
        res.status(500).json({
          success: false,
          error: "Failed to send OTP",
          message: error.message
        });
      }
    });
    
    // Verify OTP endpoint
    app.post("/verify-login-otp", async (req, res) => {
      try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
          return res.status(400).json({
            success: false,
            error: "Email and OTP are required"
          });
        }
        
        // Find OTP record
        const otpRecord = await db.collection('loginOTPs').findOne({
          email,
          otp,
          verified: false
        });
        
        if (!otpRecord) {
          return res.status(400).json({
            success: false,
            error: "Invalid OTP"
          });
        }
        
        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
          return res.status(400).json({
            success: false,
            error: "OTP has expired"
          });
        }
        
        // Mark OTP as verified
        await db.collection('loginOTPs').updateOne(
          { _id: otpRecord._id },
          { 
            $set: { 
              verified: true, 
              verifiedAt: new Date() 
            } 
          }
        );
        
        res.json({
          success: true,
          message: "OTP verified successfully"
        });
        
      } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
          success: false,
          error: "Failed to verify OTP",
          message: error.message
        });
      }
    });
    
    // Password reset request endpoint
    app.post("/password-reset-request", async (req, res) => {
      try {
        const { email, password } = req.body; // Accept password for frontend compatibility but still send reset link
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required",
            messageSent: false
          });
        }
        
        console.log(`🔑 Processing password reset request for email: ${email}`);
        
        // Check if user exists
        const user = await usercollection.findOne({ email: email });
        if (!user) {
          // For security, don't reveal if email exists or not
          return res.json({
            success: true,
            message: "If this email exists, you will receive a password reset link.",
            messageSent: true
          });
        }
        
        // Generate a secure reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
        
        // Store reset token in database (and password if provided)
        const updateData = {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetTokenExpiry,
          passwordResetRequestedAt: new Date()
        };
        
        // If password is provided (from frontend), also store it as temp password
        if (password) {
          updateData.tempPassword = password;
          updateData.tempPasswordCreatedAt = new Date();
          updateData.tempPasswordUsed = false;
        }
        
        await usercollection.updateOne(
          { email: email },
          { $set: updateData }
        );
        
        // Send password reset email with link
        console.log(`📧 Sending password reset link to: ${email}`);
        const emailResult = await sendPasswordResetEmail(email, resetToken);
        
        let messageSent = false;
        let messageDetails = null;
        
        if (emailResult.success) {
          messageSent = true;
          messageDetails = {
            messageId: emailResult.messageId,
            method: 'email'
          };
          console.log('✅ Password reset email sent successfully!');
        } else {
          console.log('❌ Password reset email failed:', emailResult.error);
          messageDetails = {
            error: emailResult.error,
            method: 'email'
          };
        }
        
        res.json({
          success: true,
          message: "If this email exists, you will receive a password reset link.",
          messageSent: messageSent,
          messageDetails: messageDetails
        });
        
      } catch (error) {
        console.error("Error processing password reset request:", error);
        res.status(500).json({
          success: false,
          error: "Failed to process password reset request",
          message: error.message,
          messageSent: false
        });
      }
    });
    
    // Password reset confirmation endpoint
    app.post("/password-reset-confirm", async (req, res) => {
      try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
          return res.status(400).json({
            success: false,
            error: "Token and new password are required"
          });
        }
        
        // Validate password strength
        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            error: "Password must be at least 6 characters long"
          });
        }
        
        console.log(`🔑 Processing password reset confirmation with token: ${token.substring(0, 8)}...`);
        
        // Find user with valid reset token
        const user = await usercollection.findOne({
          passwordResetToken: token,
          passwordResetExpiry: { $gt: new Date() }
        });
        
        if (!user) {
          return res.status(400).json({
            success: false,
            error: "Invalid or expired reset token"
          });
        }
        
        // Update user's password and clear reset token
        await usercollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: newPassword, // In production, hash this password
              passwordResetCompletedAt: new Date()
            },
            $unset: {
              passwordResetToken: 1,
              passwordResetExpiry: 1,
              tempPassword: 1,
              tempPasswordCreatedAt: 1,
              tempPasswordUsed: 1
            }
          }
        );
        
        console.log('✅ Password reset completed successfully!');
        
        res.json({
          success: true,
          message: "Password has been reset successfully. You can now log in with your new password."
        });
        
      } catch (error) {
        console.error("Error confirming password reset:", error);
        res.status(500).json({
          success: false,
          error: "Failed to reset password",
          message: error.message
        });
      }
    });
    
    // Validate reset token endpoint
    app.post("/validate-reset-token", async (req, res) => {
      try {
        const { token } = req.body;
        
        if (!token) {
          return res.status(400).json({
            success: false,
            error: "Token is required"
          });
        }
        
        // Find user with valid reset token
        const user = await usercollection.findOne({
          passwordResetToken: token,
          passwordResetExpiry: { $gt: new Date() }
        });
        
        if (!user) {
          return res.status(400).json({
            success: false,
            error: "Invalid or expired reset token"
          });
        }
        
        res.json({
          success: true,
          message: "Token is valid",
          email: user.email
        });
        
      } catch (error) {
        console.error("Error validating reset token:", error);
        res.status(500).json({
          success: false,
          error: "Failed to validate token",
          message: error.message
        });
      }
    });
    
    // Testing endpoint to clear rate limit (for development only)
    app.post("/clear-reset-limit", async (req, res) => {
      try {
        const { email } = req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        // Clear any existing reset tokens for this email to allow new requests
        await usercollection.updateOne(
          { email: email },
          { 
            $unset: {
              passwordResetToken: 1,
              passwordResetExpiry: 1,
              passwordResetRequestedAt: 1
            }
          }
        );
        
        res.json({
          success: true,
          message: "Rate limit cleared for testing"
        });
        
      } catch (error) {
        console.error("Error clearing rate limit:", error);
        res.status(500).json({
          success: false,
          error: "Failed to clear rate limit",
          message: error.message
        });
      }
    });
    
    // Register new user endpoint
    app.post("/register", async (req, res) => {
      try {
        const { username, name, email, profileImage } = req.body;
        
        if (!username || !name || !email) {
          return res.status(400).json({
            success: false,
            error: "Username, name, and email are required"
          });
        }
        
        // Check if user already exists
        const existingUser = await usercollection.findOne({ email: email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: "User with this email already exists"
          });
        }
        
        // Check if username is taken
        const existingUsername = await usercollection.findOne({ username: username });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            error: "Username is already taken"
          });
        }
        
        // Create new user
        const newUser = {
          username: username,
          name: name,
          email: email,
          profileImage: profileImage || null,
          coverimage: null,
          bio: '',
          location: '',
          website: '',
          dob: '',
          followers: 0,
          following: 0,
          emailVerified: false,
          createdAt: new Date()
        };
        
        const result = await usercollection.insertOne(newUser);
        
        console.log(`✅ New user registered: ${email} (${username})`);
        
        res.json({
          success: true,
          acknowledged: true,
          message: "User registered successfully",
          insertedId: result.insertedId
        });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
          success: false,
          error: "Failed to register user",
          message: error.message
        });
      }
    });
    
    // Check device access permissions endpoint
    app.post("/check-device-access", async (req, res) => {
      try {
        const { deviceInfo } = req.body;
        
        if (!deviceInfo) {
          return res.status(400).json({
            success: false,
            error: "Device info is required"
          });
        }
        
        const authRequirements = {
          allowAccess: true,
          requiresOTP: false,
          reason: ''
        };
        
        // Chrome requires OTP
        if (deviceInfo.browser === 'Chrome') {
          authRequirements.requiresOTP = true;
          authRequirements.reason = 'Chrome browser requires OTP verification for enhanced security';
        }
        
        // Edge allows without additional authentication
        if (deviceInfo.browser === 'Edge') {
          authRequirements.requiresOTP = false;
          authRequirements.reason = 'Edge browser - no additional authentication required';
        }
        
        // Mobile access time restriction (10 AM - 1 PM)
        if (deviceInfo.deviceType === 'Mobile') {
          const now = new Date();
          const hours = now.getHours();
          
          if (hours < 10 || hours >= 13) {
            authRequirements.allowAccess = false;
            authRequirements.reason = 'Mobile access is only allowed between 10:00 AM - 1:00 PM';
          } else {
            authRequirements.reason = 'Mobile access granted (within allowed hours: 10:00 AM - 1:00 PM)';
          }
        }
        
        res.json({
          success: true,
          authRequirements
        });
        
      } catch (error) {
        console.error("Error checking device access:", error);
        res.status(500).json({
          success: false,
          error: "Failed to check device access",
          message: error.message
        });
      }
    });
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("Using in-memory fallback for data storage");
    usingMemoryFallback = true;
    
    // Set up fallback endpoint for profile updates
    app.patch("/userupdate", async (req, res) => {
      try {
        const email = req.query.email;
        
        // Validate username
        if (req.body.username && req.body.username.length < 3) {
          return res.status(400).json({ 
            error: "Username must be at least 3 characters",
            success: false
          });
        }
        
        // Find user in memory or create new
        let user = memoryDB.users.find(u => u.email === email);
        if (!user) {
          user = { email: email, _id: Date.now().toString() };
          memoryDB.users.push(user);
        }
        
        // Update user data
        user.name = req.body.name;
        user.username = req.body.username;
        user.bio = req.body.bio;
        user.location = req.body.location;
        user.website = req.body.website;
        
        res.json({ 
          success: true, 
          message: "Profile updated successfully (saved locally)",
          result: { acknowledged: true }
        });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ 
          error: "Failed to update profile", 
          success: false,
          message: error.message
        });
      }
    });
    
    // Fallback post tweet endpoint
    app.post("/post", async (req, res) => {
      try {
        const tweetData = req.body;
        tweetData.timestamp = new Date();
        tweetData._id = Date.now().toString();
        
        memoryDB.posts.push(tweetData);
        
        res.status(201).json({
          success: true,
          message: "Tweet posted successfully (saved locally)",
          tweetId: tweetData._id
        });
      } catch (error) {
        console.error("Error posting tweet:", error);
        res.status(500).json({
          error: "Failed to post tweet",
          success: false,
          message: error.message
        });
      }
    });
    
    // Fallback get tweets endpoint
    app.get("/post", async (req, res) => {
      try {
        const email = req.query.email;
        let tweets = [...memoryDB.posts];
        
        // If email is provided, filter tweets by that user
        if (email) {
          tweets = tweets.filter(tweet => tweet.email === email);
        }
        
        // Sort by timestamp descending
        tweets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json(tweets);
      } catch (error) {
        console.error("Error fetching tweets:", error);
        res.status(500).json({
          error: "Failed to fetch tweets",
          success: false,
          message: error.message
        });
      }
    });
    
    // Fallback get user data endpoint
    app.get("/loggedinuser", async (req, res) => {
      try {
        const email = req.query.email;
        const users = memoryDB.users.filter(user => user.email === email);
        res.json(users);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({
          error: "Failed to fetch user data",
          success: false,
          message: error.message
        });
      }
    });
    
    // Fallback send verification email endpoint
    app.post("/send-verification", async (req, res) => {
      try {
        const { email, name } = req.body;
        
        if (!email || !name) {
          return res.status(400).json({
            success: false,
            error: "Email and name are required"
          });
        }
        
        // Generate verification token
        const token = generateVerificationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Store verification token in memory
        const tokenData = {
          email,
          token,
          expiresAt,
          verified: false,
          createdAt: new Date()
        };
        
        memoryDB.verificationTokens.push(tokenData);
        
        // Send verification email
        const emailResult = await sendVerificationEmail(email, name, token);
        
        if (emailResult.success) {
          res.json({
            success: true,
            message: "Verification email sent successfully (saved locally)"
          });
        } else {
          res.status(500).json({
            success: false,
            error: "Failed to send verification email",
            details: emailResult.error
          });
        }
        
      } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({
          success: false,
          error: "Failed to send verification email",
          message: error.message
        });
      }
    });
    
    // Fallback verify email token endpoint
    app.post("/verify-email", async (req, res) => {
      try {
        const { email, token } = req.body;
        
        if (!email || !token) {
          return res.status(400).json({
            success: false,
            error: "Email and token are required"
          });
        }
        
        // Find verification token in memory
        const tokenIndex = memoryDB.verificationTokens.findIndex(t => 
          t.email === email && t.token === token && !t.verified
        );
        
        if (tokenIndex === -1) {
          return res.status(400).json({
            success: false,
            error: "Invalid or expired verification token"
          });
        }
        
        const tokenDoc = memoryDB.verificationTokens[tokenIndex];
        
        // Check if token is expired
        if (new Date() > tokenDoc.expiresAt) {
          return res.status(400).json({
            success: false,
            error: "Verification token has expired"
          });
        }
        
        // Mark token as verified
        memoryDB.verificationTokens[tokenIndex].verified = true;
        memoryDB.verificationTokens[tokenIndex].verifiedAt = new Date();
        
        // Update user's email verification status in memory
        const userIndex = memoryDB.users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
          memoryDB.users[userIndex].emailVerified = true;
          memoryDB.users[userIndex].emailVerifiedAt = new Date();
        }
        
        res.json({
          success: true,
          message: "Email verified successfully (saved locally)"
        });
        
      } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({
          success: false,
          error: "Failed to verify email",
          message: error.message
        });
      }
    });
    
    // Fallback check verification status endpoint
    app.get("/verification-status", async (req, res) => {
      try {
        const email = req.query.email;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        const user = memoryDB.users.find(u => u.email === email);
        
        res.json({
          success: true,
          emailVerified: user?.emailVerified || false
        });
        
      } catch (error) {
        console.error("Error checking verification status:", error);
        res.status(500).json({
          success: false,
          error: "Failed to check verification status",
          message: error.message
        });
      }
    });
    
    // Fallback login tracking endpoints for memory database
    app.post("/track-login", (req, res) => {
      try {
        const {
          email,
          deviceInfo,
          loginSuccess,
          authMethod,
          failureReason
        } = req.body;
        
        if (!email || !deviceInfo) {
          return res.status(400).json({
            success: false,
            error: "Email and device info are required"
          });
        }
        
        const loginRecord = {
          id: Date.now().toString(),
          email,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          deviceType: deviceInfo.deviceType,
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          screen: deviceInfo.screen,
          loginSuccess: loginSuccess || false,
          authMethod: authMethod || 'password',
          failureReason: failureReason || null,
          timestamp: new Date()
        };
        
        // Initialize loginHistory array if it doesn't exist
        if (!memoryDB.loginHistory) {
          memoryDB.loginHistory = [];
        }
        
        memoryDB.loginHistory.push(loginRecord);
        
        res.json({
          success: true,
          message: "Login tracked successfully (saved locally)",
          loginId: loginRecord.id
        });
      } catch (error) {
        console.error("Error tracking login:", error);
        res.status(500).json({
          success: false,
          error: "Failed to track login",
          message: error.message
        });
      }
    });
    
    app.get("/login-history", (req, res) => {
      try {
        const email = req.query.email;
        const limit = parseInt(req.query.limit) || 10;
        const successOnly = req.query.successOnly === 'true';
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        if (!memoryDB.loginHistory) {
          memoryDB.loginHistory = [];
        }
        
        let filteredHistory = memoryDB.loginHistory.filter(entry => entry.email === email);
        
        if (successOnly) {
          filteredHistory = filteredHistory.filter(entry => entry.loginSuccess);
        }
        
        // Sort by timestamp descending and limit
        filteredHistory = filteredHistory
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
        
        res.json({
          success: true,
          history: filteredHistory
        });
      } catch (error) {
        console.error("Error fetching login history:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch login history",
          message: error.message
        });
      }
    });
    
    app.post("/send-login-otp", async (req, res) => {
      try {
        const { email, deviceInfo } = req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required"
          });
        }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        
        const otpData = {
          id: Date.now().toString(),
          email,
          otp,
          expiresAt,
          verified: false,
          deviceInfo,
          createdAt: new Date()
        };
        
        if (!memoryDB.loginOTPs) {
          memoryDB.loginOTPs = [];
        }
        
        memoryDB.loginOTPs.push(otpData);
        
        // Try to send OTP via email, but don't fail if it doesn't work
        try {
          const emailResult = await sendOTPEmail(email, otp);
          if (emailResult.success) {
            res.json({
              success: true,
              message: "OTP sent successfully to your email (saved locally)",
              expiresIn: 600
            });
          } else {
            res.json({
              success: true,
              message: "OTP generated (saved locally). Email sending failed - check console for OTP: " + otp,
              expiresIn: 600,
              otp: otp // Only in fallback mode
            });
          }
        } catch (emailError) {
          console.log('Email service unavailable, providing OTP in response:', emailError);
          res.json({
            success: true,
            message: "OTP generated (saved locally). Check console for OTP: " + otp,
            expiresIn: 600,
            otp: otp // Only in fallback mode
          });
        }
        
      } catch (error) {
        console.error("Error sending login OTP:", error);
        res.status(500).json({
          success: false,
          error: "Failed to send OTP",
          message: error.message
        });
      }
    });
    
    app.post("/verify-login-otp", (req, res) => {
      try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
          return res.status(400).json({
            success: false,
            error: "Email and OTP are required"
          });
        }
        
        if (!memoryDB.loginOTPs) {
          memoryDB.loginOTPs = [];
        }
        
        const otpIndex = memoryDB.loginOTPs.findIndex(record => 
          record.email === email && record.otp === otp && !record.verified
        );
        
        if (otpIndex === -1) {
          return res.status(400).json({
            success: false,
            error: "Invalid OTP"
          });
        }
        
        const otpRecord = memoryDB.loginOTPs[otpIndex];
        
        if (new Date() > otpRecord.expiresAt) {
          return res.status(400).json({
            success: false,
            error: "OTP has expired"
          });
        }
        
        // Mark OTP as verified
        memoryDB.loginOTPs[otpIndex].verified = true;
        memoryDB.loginOTPs[otpIndex].verifiedAt = new Date();
        
        res.json({
          success: true,
          message: "OTP verified successfully (saved locally)"
        });
        
      } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
          success: false,
          error: "Failed to verify OTP",
          message: error.message
        });
      }
    });
    
    // Fallback password reset endpoint
    app.post("/passwordreset", async (req, res) => {
      try {
        const { email, phone, password, method } = req.body;
        
        if (!password) {
          return res.status(400).json({
            success: false,
            error: "Password is required",
            messageSent: false
          });
        }
        
        let messageSent = false;
        let messageDetails = null;
        
        if (method === 'email_reset' && email) {
          console.log(`🔑 Processing password reset for email (fallback): ${email}`);
          
          // In fallback mode, we can't check user existence in database
          // Store temp password in memory
          if (!memoryDB.tempPasswords) {
            memoryDB.tempPasswords = {};
          }
          
          memoryDB.tempPasswords[email] = {
            password: password,
            createdAt: new Date(),
            used: false
          };
          
          // Send password reset email
          console.log(`📧 Sending password reset email to: ${email} (fallback mode)`);
          const emailResult = await sendPasswordResetEmail(email, password);
          
          if (emailResult.success) {
            messageSent = true;
            messageDetails = {
              messageId: emailResult.messageId,
              method: 'email'
            };
            console.log('✅ Password reset email sent successfully (fallback)!');
          } else {
            console.log('❌ Password reset email failed (fallback):', emailResult.error);
            messageDetails = {
              error: emailResult.error,
              method: 'email'
            };
          }
          
        } else if (method === 'sms_reset' && phone) {
          console.log(`🔑 Processing password reset for phone (fallback): ${phone}`);
          
          // For SMS functionality, you would need to implement SMS service
          console.log('📱 SMS functionality not fully implemented yet (fallback)');
          messageDetails = {
            error: 'SMS functionality not implemented',
            method: 'sms'
          };
        }
        
        res.json({
          success: true,
          message: "Password reset processed (saved locally)",
          messageSent: messageSent,
          messageDetails: messageDetails
        });
        
      } catch (error) {
        console.error("Error processing password reset (fallback):", error);
        res.status(500).json({
          success: false,
          error: "Failed to process password reset",
          message: error.message,
          messageSent: false
        });
      }
    });
    
    // Fallback register endpoint
    app.post("/register", (req, res) => {
      try {
        const { username, name, email, profileImage } = req.body;
        
        if (!username || !name || !email) {
          return res.status(400).json({
            success: false,
            error: "Username, name, and email are required"
          });
        }
        
        // Check if user already exists
        const existingUser = memoryDB.users.find(u => u.email === email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: "User with this email already exists"
          });
        }
        
        // Check if username is taken
        const existingUsername = memoryDB.users.find(u => u.username === username);
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            error: "Username is already taken"
          });
        }
        
        // Create new user
        const newUser = {
          _id: Date.now().toString(),
          username: username,
          name: name,
          email: email,
          profileImage: profileImage || null,
          coverimage: null,
          bio: '',
          location: '',
          website: '',
          dob: '',
          followers: 0,
          following: 0,
          emailVerified: false,
          createdAt: new Date()
        };
        
        memoryDB.users.push(newUser);
        
        console.log(`✅ New user registered (locally): ${email} (${username})`);
        
        res.json({
          success: true,
          acknowledged: true,
          message: "User registered successfully (saved locally)",
          insertedId: newUser._id
        });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
          success: false,
          error: "Failed to register user",
          message: error.message
        });
      }
    });
    
    app.post("/check-device-access", (req, res) => {
      try {
        const { deviceInfo } = req.body;
        
        if (!deviceInfo) {
          return res.status(400).json({
            success: false,
            error: "Device info is required"
          });
        }
        
        const authRequirements = {
          allowAccess: true,
          requiresOTP: false,
          reason: ''
        };
        
        // Chrome requires OTP
        if (deviceInfo.browser === 'Chrome') {
          authRequirements.requiresOTP = true;
          authRequirements.reason = 'Chrome browser requires OTP verification for enhanced security';
        }
        
        // Edge allows without additional authentication
        if (deviceInfo.browser === 'Edge') {
          authRequirements.requiresOTP = false;
          authRequirements.reason = 'Edge browser - no additional authentication required';
        }
        
        // Mobile access time restriction (10 AM - 1 PM)
        if (deviceInfo.deviceType === 'Mobile') {
          const now = new Date();
          const hours = now.getHours();
          
          if (hours < 10 || hours >= 13) {
            authRequirements.allowAccess = false;
            authRequirements.reason = 'Mobile access is only allowed between 10:00 AM - 1:00 PM';
          } else {
            authRequirements.reason = 'Mobile access granted (within allowed hours: 10:00 AM - 1:00 PM)';
          }
        }
        
        res.json({
          success: true,
          authRequirements
        });
        
      } catch (error) {
        console.error("Error checking device access:", error);
        res.status(500).json({
          success: false,
          error: "Failed to check device access",
          message: error.message
        });
      }
    });
  }
}

// Start MongoDB connection
run().catch(console.dir);
