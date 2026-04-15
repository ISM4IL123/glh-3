import express from "express";
import { readDB, writeDB } from "../db.js";
import { requireAuth, attachUser, requireRole } from "../middleware/auth.js";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const producerApplySchema = z.object({
    userId: z.string().trim().min(1).max(64),
    businessName: z.string().trim().min(1).max(120),
    businessType: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000)
});

const updateStatusSchema = z.object({
    applicationId: z.string().trim().min(1).max(64),
    status: z.enum(["approved", "rejected", "pending"])
});

const addProductSchema = z.object({
    name: z.string().trim().min(1).max(120),
    price: z.number().finite().nonnegative(),
    stock: z.number().int().nonnegative(),
    category: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000),
    image: z.string().trim().max(255).optional().default("")
});

const updateProductSchema = z.object({
    stock: z.number().int().nonnegative().optional(),
    description: z.string().trim().min(1).max(2000).optional()
});

const checkoutSchema = z.object({
    items: z
        .array(
            z.object({
                id: z.string().trim().min(1).max(64),
                quantity: z.number().int().positive()
            })
        )
        .min(1),
    deliveryType: z.enum(["delivery", "collection"]).optional().default("collection"),
    address: z
        .object({
            street: z.string().trim().min(1).max(120),
            city: z.string().trim().min(1).max(120),
            postcode: z.string().trim().min(1).max(20)
        })
        .optional(),
    paymentMethod: z.enum(["card", "cash", "visa"]).optional().default("card")
});

// Test endpoint
router.get("/test", (req, res) => {
    console.log("Producer route test endpoint hit");
    res.json({ success: true, message: "Producer routes are working" });
});

// Apply to be a producer
router.post("/apply", validateBody(producerApplySchema), async (req, res) => {
    try {
        const { userId, businessName, businessType, description } = req.body;
        console.log("Producer apply request:", { userId, businessName, businessType, description });

        const db = readDB();

        // Initialize applications array if it doesn't exist
        if (!db.applications) {
            db.applications = [];
        }

        // Check if user already has a pending application
        const existingApp = db.applications.find(
            app => app.userId === userId && app.status === "pending"
        );

        if (existingApp) {
            return res.status(400).json({ 
                success: false, 
                message: "You already have a pending application" 
            });
        }

        const application = {
            _id: Date.now().toString(),
            userId,
            businessName,
            businessType,
            description,
            status: "pending",
            createdAt: new Date().toISOString()
        };

        db.applications.push(application);
        writeDB(db);

        console.log(`✅ Producer application submitted: ${businessName} (${userId})`);
        res.status(201).json({
            success: true,
            message: "Application submitted successfully"
        });

    } catch (err) {
        console.error("❌ Producer application error:", err);
        res.status(500).json({ 
            success: false, 
            message: `Server error: ${err.message}` 
        });
    }
});

// Get all applications (admin only)
router.get("/applications", requireAuth, attachUser, requireRole("admin"), async (req, res) => {
    try {
        const db = readDB();
        const applications = db.applications || [];

        res.status(200).json({
            success: true,
            applications
        });
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

// Update application status (admin only)
router.post(
    "/update-status",
    requireAuth,
    attachUser,
    requireRole("admin"),
    validateBody(updateStatusSchema),
    async (req, res) => {
    try {
        const { applicationId, status } = req.body;

        const db = readDB();
        const application = db.applications?.find(app => app._id === applicationId);

        if (!application) {
            return res.status(404).json({ 
                success: false, 
                message: "Application not found" 
            });
        }

        application.status = status;
        application.updatedAt = new Date().toISOString();

        // If approved, mark user as producer
        if (status === "approved") {
            const user = db.users.find(u => u._id === application.userId);
            if (user) {
                user.status = "producer";
                user.businessName = application.businessName;
                user.businessType = application.businessType;
            }
        }

        writeDB(db);

        console.log(`✅ Application ${applicationId} updated to ${status}`);
        res.status(200).json({
            success: true,
            message: "Application updated successfully"
        });

    } catch (err) {
        console.error("Error updating application:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

// Add product by producer
router.post(
  "/add-product",
  requireAuth,
  attachUser,
  requireRole("producer"),
  validateBody(addProductSchema),
  async (req, res) => {
  try {
    const { name, price, stock, category, description, image = '' } = req.body;
    const db = readDB();
    const user = req.user;

    const newProduct = {
      id: Date.now().toString(),
      name,
      price,
      stock,
      category,
      description,
      image,
      producer: user.name,
      createdAt: new Date().toISOString()
    };

    if (!db.products) db.products = [];
    db.products.push(newProduct);
    writeDB(db);

    console.log(`✅ Product added by ${user.name}: ${name}`);
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct
    });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get producer's products only (auth required)
router.get("/my-products", requireAuth, attachUser, requireRole("producer"), async (req, res) => {
  try {
    const db = readDB();
    const user = req.user;

    const products = (db.products || []).filter(p => p.producer === user.name);
    console.log(`Producer ${user.name} fetched ${products.length} products`);

    res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error("My products error:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Delete product
router.delete("/product/:productId", requireAuth, attachUser, requireRole("producer"), async (req, res) => {
  try {
    const { productId } = req.params;
    const db = readDB();
    const user = req.user;

    const productIndex = db.products?.findIndex(p => p.id === productId && p.producer === user.name);

    if (productIndex === -1 || productIndex === undefined) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    db.products.splice(productIndex, 1);
    writeDB(db);

    console.log(`✅ Product deleted: ${productId} by ${user.name}`);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Get loyalty points (auth required)
router.get("/points", requireAuth, attachUser, async (req, res) => {
  try {
    const db = readDB();
    const user = req.user;

    const points = user.loyaltyPoints || 0;

    res.status(200).json({
      success: true,
      loyaltyPoints: points
    });
  } catch (err) {
    console.error("Error fetching points:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Update product (partial update - only fields provided)
router.put(
  "/product/:productId",
  requireAuth,
  attachUser,
  requireRole("producer"),
  validateBody(updateProductSchema),
  async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    const db = readDB();
    const user = req.user;

    const product = db.products?.find(p => p.id === productId && p.producer === user.name);
    if (!product) {
      console.log("❌ Product not found for producer:", productId, user.name);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Partial update - update any fields provided
    const updatedFields = [];
    if (updateData.stock !== undefined) {
      product.stock = updateData.stock;
      updatedFields.push(`stock: ${product.stock}`);
    }
    if (updateData.description !== undefined) {
      product.description = updateData.description;
      updatedFields.push("description");
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    product.updatedAt = new Date().toISOString();

    writeDB(db);
    console.log(`✅ Product updated: ${productId} (${updatedFields.join(", ")})`);
    res.status(200).json({
      success: true,
      message: `Updated: ${updatedFields.join(", ")}`,
      product
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Get order history (auth required)
router.get("/order-history", requireAuth, attachUser, async (req, res) => {
  try {
    const db = readDB();
    const user = req.user;

    const orders = user.orders || [];
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error("Error fetching order history:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Checkout - reduce stock for purchased items + award loyalty points
router.post("/checkout", requireAuth, attachUser, validateBody(checkoutSchema), async (req, res) => {
    try {
        const { items, deliveryType, address, paymentMethod } = req.body;

        const db = readDB();
        const user = req.user;

        // Validate delivery if provided
        if (deliveryType === "delivery" && (!address || !address.street || !address.city || !address.postcode)) {
            return res.status(400).json({ 
                success: false, 
                message: "Complete delivery address required" 
            });
        }

        // Validate all items exist and have sufficient stock before making changes
        for (const item of items) {
            const product = db.products?.find(p => p.id === item.id);

            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Product ${item.id} not found` 
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
                });
            }
        }

        // Calculate total spent for loyalty points (1 point per £) and prepare order
        let totalSpent = 0;
        const orderItems = [];
        for (const item of items) {
            const product = db.products.find(p => p.id === item.id);
            const subtotal = product.price * item.quantity;
            totalSpent += subtotal;
            orderItems.push({
                id: product.id,
                name: product.name,
                producer: product.producer,
                price: product.price,
                quantity: item.quantity,
                subtotal: subtotal
            });
        }
        // Add delivery fee
        const deliveryFee = deliveryType === "delivery" ? 3.99 : 0;
        totalSpent += deliveryFee;
        const pointsEarned = Math.floor(totalSpent);


        // Initialize orders array if needed
        if (!user.orders) {
            user.orders = [];
        }

        // Create new order entry
        const newOrder = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            deliveryType: deliveryType || "collection",
            address: address || null,
            paymentMethod: paymentMethod || "card",
            items: orderItems,
            deliveryFee: deliveryFee,
            total: totalSpent
        };
        user.orders.unshift(newOrder); // Add to beginning for recency


        // Award points (initialize if not exist)
        if (user.loyaltyPoints === undefined) {
            user.loyaltyPoints = 0;
        }
        user.loyaltyPoints += pointsEarned;

        // Reduce stock
        const updatedItems = [];
        for (const item of items) {
            const product = db.products.find(p => p.id === item.id);
            product.stock -= item.quantity;
            updatedItems.push({
                id: product.id,
                name: product.name,
                stock: product.stock,
                quantity: item.quantity
            });
            console.log(`📦 ${product.name} stock reduced by ${item.quantity} (now: ${product.stock})`);
        }

        writeDB(db);

        console.log(`✅ Checkout completed by ${user.name}: £${totalSpent.toFixed(2)} spent (${deliveryType}, ${paymentMethod}), ${pointsEarned} loyalty points awarded (total: ${user.loyaltyPoints}), Order ID: ${newOrder.id}`);
        res.status(200).json({
            success: true,
            message: "Checkout successful",
            orderId: newOrder.id,
            updatedProducts: updatedItems,
            pointsEarned,
            totalLoyaltyPoints: user.loyaltyPoints,
            deliveryType,
            total: totalSpent
        });


    } catch (err) {
        console.error("❌ Error during checkout:", err.message);
        res.status(500).json({ 
            success: false, 
            message: `Server error: ${err.message}` 
        });
    }
});

export default router;
