import app from "./src/app.js";
import { config } from "dotenv";
config();
const startServer = () => {
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`Server started at port ${port}.`);
    });
};
startServer();
//# sourceMappingURL=server.js.map