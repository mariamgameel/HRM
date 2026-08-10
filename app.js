const app = require("./src/app");
const connectedDB = require("./src/config/db");

const port = process.env.PORT || 3000;

connectedDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});