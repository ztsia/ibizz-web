import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { findUpSync } from 'find-up';

// Define Package type to replace the one from @manypkg/get-packages
export interface Package {
  dir: string;
  packageJson: {
    [key: string]: unknown;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    name: string;
    peerDependencies?: Record<string, string>;
    version: string;
  };
}

/**
 * 查找大仓的根目录
 * @param cwd
 */
function findMonorepoRoot(cwd: string = process.cwd()) {
  const lockFile = findUpSync('pnpm-lock.yaml', {
    cwd,
    type: 'file',
  });
  return dirname(lockFile || '');
}

/**
 * 读取 pnpm-workspace.yaml 文件获取工作区配置
 */
function getWorkspaceGlobs(rootDir: string): string[] {
  try {
    const workspaceFile = join(rootDir, 'pnpm-workspace.yaml');
    if (!existsSync(workspaceFile)) {
      return [];
    }

    const content = readFileSync(workspaceFile, 'utf-8');
    const packageGlobs: string[] = [];

    // 简单解析 YAML 获取 packages 数组
    const packagesMatch = content.match(/packages:\s*\n([\s\S]*?)(?:\n\n|$)/);
    if (packagesMatch && packagesMatch[1]) {
      const packagesLines = packagesMatch[1].split('\n');
      for (const line of packagesLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('-')) {
          const glob = trimmedLine.slice(1).trim();
          if (glob) {
            packageGlobs.push(glob);
          }
        }
      }
    }

    return packageGlobs;
  } catch (error) {
    console.error('Error reading workspace config:', error);
    return [];
  }
}

/**
 * 解析工作区 glob 模式为实际目录
 */
function resolveWorkspaceDirectories(
  rootDir: string,
  globs: string[],
): string[] {
  const directories: string[] = [];

  for (const glob of globs) {
    // 简单处理常见的 glob 模式
    if (glob.endsWith('/*')) {
      const baseDir = glob.slice(0, -2);
      const fullBaseDir = resolve(rootDir, baseDir);

      if (existsSync(fullBaseDir)) {
        try {
          const subdirs = readdirSync(fullBaseDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => join(fullBaseDir, dirent.name));

          directories.push(...subdirs);
        } catch (error) {
          console.error(`Error reading directory ${fullBaseDir}:`, error);
        }
      }
    } else {
      // 处理不带通配符的目录
      const fullDir = resolve(rootDir, glob);
      if (existsSync(fullDir)) {
        directories.push(fullDir);
      }
    }
  }

  return directories;
}

/**
 * 读取包的 package.json
 */
function readPackageJson(packageDir: string) {
  try {
    const packageJsonPath = join(packageDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
      return null;
    }

    const content = readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading package.json in ${packageDir}:`, error);
    return null;
  }
}

/**
 * 获取大仓的所有包
 */
function getPackagesSync() {
  const root = findMonorepoRoot();
  const globs = getWorkspaceGlobs(root);
  const packageDirs = resolveWorkspaceDirectories(root, globs);

  const packages: Package[] = [];

  for (const dir of packageDirs) {
    const packageJson = readPackageJson(dir);
    if (packageJson && packageJson.name) {
      packages.push({
        dir,
        packageJson,
      });
    }
  }

  return { packages, rootDir: root };
}

/**
 * 获取大仓的所有包
 */
async function getPackages() {
  // 使用同步版本，因为我们已经重写了实现
  return getPackagesSync();
}

/**
 * 获取大仓指定的包
 */
async function getPackage(pkgName: string) {
  const { packages } = getPackagesSync();
  return packages.find((pkg) => pkg.packageJson.name === pkgName);
}

export { findMonorepoRoot, getPackage, getPackages, getPackagesSync };
