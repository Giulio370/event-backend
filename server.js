require('dotenv').config();
require('module-alias/register');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("EMAIL_SECRET in server.js:", process.env.EMAIL_SECRET);


});

