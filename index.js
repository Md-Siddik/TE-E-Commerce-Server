const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://technoespial:GrEE56n8g3PGUD3c@cluster0.yscbe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {

  try {

    await client.connect();

    const productsCollection = client.db('TechnoEspial').collection('teShop');
    const customersCollection = client.db('TechnoEspial').collection('teShopCustomer');

    /*
    =========================
        CREATE PRODUCT
    =========================
    */
    app.post('/products', async (req, res) => {
      try {
        const product = req.body;

        const result = await productsCollection.insertOne(product);

        res.send({
          success: true,
          message: "Product Added Successfully",
          data: result
        });

      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to add product"
        });
      }
    });

    /*
    =========================
        GET ALL PRODUCTS
    =========================
    */
    app.get('/products', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit);

        let cursor = productsCollection.find();

        if (limit) {
          cursor = cursor.limit(limit);
        }

        const result = await cursor.toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch products"
        });
      }
    });

    /*
    =========================
        GET PRODUCTS BY CATEGORY
    =========================
    */
    app.get('/products/category/:category', async (req, res) => {
      try {
        const category = req.params.category;

        const result = await productsCollection.find({ category }).toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch category products"
        });
      }
    });

    /*
    =========================
        GET SINGLE PRODUCT
    =========================
    */
    app.get('/products/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await productsCollection.findOne({
          _id: new ObjectId(id)
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch product"
        });
      }
    });

    /*
    =========================
        UPDATE PRODUCT
    =========================
    */
    app.put('/products/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const updatedProduct = req.body;

        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedProduct }
        );

        res.send({
          success: true,
          message: "Product Updated Successfully",
          data: result
        });

      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to update product"
        });
      }
    });

    /*
    =========================
        DELETE PRODUCT
    =========================
    */
    app.delete('/products/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await productsCollection.deleteOne({
          _id: new ObjectId(id)
        });

        res.send({
          success: true,
          message: "Product Deleted Successfully",
          data: result
        });

      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to delete product"
        });
      }
    });

    /*
    =========================
        PRODUCTS API
    =========================
    */

    app.post('/products', async (req, res) => {
      const result = await productsCollection.insertOne(req.body);
      res.send(result);
    });

    app.get('/products', async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    app.get('/products/:id', async (req, res) => {
      const result = await productsCollection.findOne({
        _id: new ObjectId(req.params.id)
      });
      res.send(result);
    });

    app.put('/products/:id', async (req, res) => {
      const result = await productsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.delete('/products/:id', async (req, res) => {
      const result = await productsCollection.deleteOne({
        _id: new ObjectId(req.params.id)
      });
      res.send(result);
    });


    /*
    =========================
        ORDERS API
    =========================
    */

    // CREATE ORDER
    app.post('/orders', async (req, res) => {

      try {

        const order = req.body;

        if (!order.phone || !order.address) {
          return res.status(400).send({
            success: false,
            message: "Phone & Address required"
          });
        }

        const result = await customersCollection.insertOne({
          ...order,
          status: "New",
          createdAt: new Date()
        });

        res.send({
          success: true,
          insertedId: result.insertedId
        });

      } catch {
        res.status(500).send({ success: false });
      }

    });


    // GET ORDERS (FILTER)
    app.get('/orders', async (req, res) => {

      const status = req.query.status;

      const query = status ? { status } : {};

      const result = await customersCollection.find(query).toArray();

      res.send(result);

    });

    //GET ORDERS
    // GET SINGLE ORDER BY ID
    app.get('/orders/:id', async (req, res) => {

      try {

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid ID"
          });
        }

        const order = await customersCollection.findOne({
          _id: new ObjectId(id)
        });

        if (!order) {
          return res.status(404).send({
            success: false,
            message: "Order not found"
          });
        }

        res.send(order);

      } catch (error) {

        console.error("GET SINGLE ERROR:", error);

        res.status(500).send({
          success: false
        });

      }

    });

    // UPDATE ORDER STATUS
    app.put('/orders/:id', async (req, res) => {

      try {

        const id = req.params.id;

        // 🔥 CHECK VALID ID
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid ID"
          });
        }

        const filter = { _id: new ObjectId(id) };

        const updateDoc = {
          $set: { status: "completed" }
        };

        const result = await customersCollection.updateOne(filter, updateDoc);

        if (result.modifiedCount === 0) {
          return res.send({
            success: false,
            message: "Order not found"
          });
        }

        res.send({ success: true });

      } catch (error) {

        console.error("UPDATE ERROR:", error);

        res.status(500).send({
          success: false,
          error: error.message
        });

      }

    });

    //DELETE ORDER STATUS
    app.delete('/orders/:id', async (req, res) => {

      try {

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ success: false });
        }

        await customersCollection.deleteOne({
          _id: new ObjectId(id)
        });

        res.send({ success: true });

      } catch (error) {

        console.error("DELETE ERROR:", error);

        res.status(500).send({ success: false });

      }

    });

    console.log("✅ MongoDB Connected Successfully");

  } finally { }

}

run().catch(console.dir);

/*
=========================
      ROOT API
=========================
*/
app.get('/', (req, res) => {
  res.send('Techno Espial is running');
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});