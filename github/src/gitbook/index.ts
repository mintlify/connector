import { Probot } from "probot";
import { gitbookInstallation } from "./installation";

const gitbook = (app: Probot) => {
    gitbookInstallation(app);
}

export default gitbook;