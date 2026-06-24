const mongoose = require('mongoose');

const uri = "mongodb://the_vault:roshan_3439@ac-jl92nuf-shard-00-00.klvohl5.mongodb.net:27017,ac-jl92nuf-shard-00-01.klvohl5.mongodb.net:27017,ac-jl92nuf-shard-00-02.klvohl5.mongodb.net:27017/TheVaultDB?ssl=true&replicaSet=atlas-jl92nuf-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { family: 4 })
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.error("ERROR", err);
    process.exit(1);
  });
