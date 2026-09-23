import app from "./app/app.js";
import config from "./config/config.js";
import { connectToDB } from "./config/db.js";

await connectToDB();

app.listen(config.PORT, () => {
  console.log(`Server is Running on port http://localhost:${config.PORT}`);
});
