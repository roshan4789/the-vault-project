require('dotenv').config();
const mongoose = require('mongoose');
const Stat = require('./models/Stat');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Stat.updateOne({ id: 'global_stats' }, { visits: 0, sales: 0 });
  console.log('Stats reset to 0');
  process.exit(0);
});
