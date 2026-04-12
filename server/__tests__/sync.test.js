const fs = require('fs');
const path = require('path');
const { syncRepo } = require('../sync');

const TEST_SYNC_DIR = path.join(__dirname, 'test_sync_dir');
// Use a small public repo for testing if needed, or mock simple-git. Let's mock simple-git.
jest.mock('simple-git');

describe('syncRepo', () => {
  let simpleGit;

  beforeEach(() => {
    simpleGit = require('simple-git');
    if (fs.existsSync(TEST_SYNC_DIR)) {
      fs.rmSync(TEST_SYNC_DIR, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(TEST_SYNC_DIR)) {
      fs.rmSync(TEST_SYNC_DIR, { recursive: true, force: true });
    }
  });

  it('should clone repository if it does not exist', async () => {
    const cloneMock = jest.fn().mockResolvedValue();
    simpleGit.mockReturnValue({ clone: cloneMock });

    await syncRepo('http://fake-repo.git', TEST_SYNC_DIR);

    expect(cloneMock).toHaveBeenCalledWith('http://fake-repo.git', TEST_SYNC_DIR);
  });

  it('should pull repository if it exists', async () => {
    fs.mkdirSync(TEST_SYNC_DIR, { recursive: true });
    const pullMock = jest.fn().mockResolvedValue();
    simpleGit.mockReturnValue({ pull: pullMock });

    await syncRepo('http://fake-repo.git', TEST_SYNC_DIR);

    expect(pullMock).toHaveBeenCalled();
  });
});
