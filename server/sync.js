const fs = require('fs');
const simpleGit = require('simple-git');

async function syncRepo(repoUrl, repoDir) {
  console.log('Starting repository sync...');
  const git = simpleGit();
  try {
    if (fs.existsSync(repoDir)) {
      console.log('Repository exists, pulling latest changes...');
      await simpleGit(repoDir).pull();
      console.log('Successfully pulled latest changes.');
    } else {
      console.log('Repository does not exist, cloning...');
      await git.clone(repoUrl, repoDir);
      console.log('Successfully cloned repository.');
    }
  } catch (error) {
    console.error('Error syncing repository:', error);
    throw error;
  }
}

module.exports = { syncRepo };
