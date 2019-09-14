import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
// const articleInfo = {
//   'learn-react': {
//     upvotes: 0,
//     comments: [],
//   },
//   'learn-node': {
//     upvotes: 0,
//     comments: [],
//   },
//   'my-thoughts-on-resumes': {
//     upvotes: 0,
//     comments: [],
//   },
// }

const app = express();

// Parse json
app.use(bodyParser.json());

const withDB = async (operations, res) => {
  try  {
    const client = await MongoClient.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('my-blog');
    
    await operations(db);

    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error });
  }
}

// Routes
// app.get('/hello', (req, res) => res.send('Hello, Thanos!'))
// app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}!`))
// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`))

app.get('/api/articles/:name', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(articleInfo);
  }, res);

  // try/catch block in case something goes wrong
  // try  {
    // const articleName = req.params.name;
    // // Connect to mongo
    // const client = await MongoClient.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true });
    // const db = client.db('my-blog');
    // const articleInfo = await db.collection('articles').findOne({ name: articleName });
    // // res.status(200).send(articleInfo);
    // res.status(200).json(articleInfo);
    // client.close();
    // res.status(200).json({ message: 'something is working'});
  // } catch (error) {
  //   res.status(500).json({ message: 'Error connecting to db', error });
  // }
  
});



// Upvote endpoint
// app.post('/api/articles/:name/upvote', (req, res) => {
//   const articleName = req.params.name;
//   articleInfo[articleName].upvotes += 1;
//   res.status(200).send(`${articleName} now has ${articleInfo[articleName].upvotes} upvotes!`);
// });
app.post('/api/articles/:name/upvote', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
          '$set': {
            upvotes: articleInfo.upvotes + 1
          }
        });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);
  }, res);

  // try {
  //   const articleName = req.params.name;
  //   const client = await MongoClient.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true, useUnifiedTopology: true });
  //   const db = client.db('my-blog');
  
  //   const articleInfo = await db.collection('articles').findOne({ name: articleName });
  
  //   await db.collection('articles').updateOne({ name: articleName }, {
  //     '$set': {
  //       upvotes: articleInfo.upvotes + 1
  //     }
  //   });
  //     const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
      
  //     res.status(200).json(updatedArticleInfo);
  //     client.close();
  // } catch (error) {
  //   res.status(500).json({ message: 'Error connecting to db', error });
  // }
});

// Comment endpoint
app.post('/api/articles/:name/add-comment', async (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  withDB(async (db) => {
   const articleInfo = await db.collection('articles').findOne({ name: articleName });
   await db.collection('articles').updateOne({ name: articleName}, {
     '$set': {
       comments: articleInfo.comments.concat({ username, text }),
     }
   });

   const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
  
   res.status(200).json(updatedArticleInfo);

  }, res);





  // Request in Postman looks like this 
  // http://localhost:8000/api/articles/learn-node/add-coment
  // {
  //   "username": "me",
  //   "text": "I love this article"
  // }
  // Get the username and text values from post
  // const { username, text } = req.body;
  // Get article name from URL Parameters
  // const articleName = req.params.name;

  // add data to the comments array found in articleInfo
  // articleInfo[articleName].comments.push({ username, text });

  // return status code
  // res.status(200).send(articleInfo[articleName]);
})

app.listen(8000, () => console.log('Listing on port 8000'));