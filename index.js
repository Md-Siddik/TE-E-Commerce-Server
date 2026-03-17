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

        const query = { category: category };

        const result = await productsCollection.find(query).toArray();

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

        const query = { _id: new ObjectId(id) };

        const result = await productsCollection.findOne(query);

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

        const filter = { _id: new ObjectId(id) };

        const updateDoc = {
          $set: updatedProduct
        };

        const result = await productsCollection.updateOne(filter, updateDoc);

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

        const query = { _id: new ObjectId(id) };

        const result = await productsCollection.deleteOne(query);

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



    console.log("MongoDB Connected Successfully");

  } finally {

  }

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
  console.log(`Techno Espial running on port ${port}`);
});