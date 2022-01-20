const chalk = require('chalk');
const simpleGit = require('simple-git/promise');

const cwd = process.cwd();
const git = simpleGit(cwd);

function exitProcess(code = 1) {
  console.log('');
  process.exit(code);
}

async function checkBranch({ current }) {
  if (current === 'master') {
    console.log(chalk.yellow('You are in the master branch. Push to the master branch is prohibited'));
    exitProcess();
  }
}

async function checkCommit({ files }) {
  if (files.length) {
    console.log(chalk.yellow('You forgot something to commit'));
    files.forEach(({ path: filePath, working_dir: mark }) => {
      console.log(' -', chalk.red(mark), filePath);
    });
    exitProcess();
  }
}

async function checkAll() {
  const status = await git.status();

  await checkBranch(status);
  await checkCommit(status);
}

checkAll();
