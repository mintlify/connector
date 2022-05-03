import { Probot } from "probot";
import { gitbookInstallation } from "./installation";
import { gitbookUpdates } from "./updates";

const gitbook = (app: Probot) => {
    gitbookInstallation(app);
    gitbookUpdates(app);
}

export default gitbook;