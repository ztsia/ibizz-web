import path from 'node:path';

import { execa } from 'execa';

/**
 * 获取暂存区文件
 */
async function getStagedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execa('git', [
      '-c',
      'submodule.recurse=false',
      'diff',
      '--staged',
      '--diff-filter=ACMR',
      '--name-only',
      '--ignore-submodules',
      '-z',
    ]);

    let changedList = stdout ? stdout.replace(/\0$/, '').split('\0') : [];
    changedList = changedList.map((item) => path.resolve(process.cwd(), item));
    const changedSet = new Set(changedList);
    changedSet.delete('');
    return [...changedSet];
  } catch (error) {
    console.error('Failed to get staged files:', error);
    return [];
  }
}

/**
 * Add files to git staging area
 */
async function gitAdd(filenames: string | string[], cwd?: string) {
  const files = Array.isArray(filenames) ? filenames : [filenames];
  await execa('git', ['add', ...files], { cwd });
}

export { getStagedFiles, gitAdd };
