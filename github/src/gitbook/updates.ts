import { Probot } from 'probot';

export const gitbookUpdates = (app: Probot) => {
    app.on('push', async (context) => {
        const owner = context.payload.repository.owner.name;
        if (owner == null) return;
        const defaultBranch = context.payload.repository.default_branch;
        const { ref } = context.payload;
        const currBranch = ref.slice(ref.lastIndexOf('/') + 1);
        if (currBranch !== defaultBranch) return; // this might need to change
        const sender = context.payload.sender.login;
        if (sender === 'gitbook-com[bot]') {
            // get md files that changed
            // get corresponding actual code files
            // call backend to get updated code files
            // update code files from here
        } else { // if code is updated...
            // get code file & existing md file
            // update md file
        }
    });
}