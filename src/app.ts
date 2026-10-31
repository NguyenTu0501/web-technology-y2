import express, {type Application} from 'express'

const PORT_NUMBER = 8080;
const application: Application = express();

application.use(express.json());
application.use(express.static("../src/public"));

application.listen(PORT_NUMBER, () => console.log(`Server started on http://localhost:${PORT_NUMBER}`));
