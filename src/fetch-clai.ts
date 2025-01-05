import { App } from "obsidian";

import * as fs from "fs";

// @ts-ignore
const request = (window as any).require('node:https').request;

// @ts-ignore
const childProcess = (window as any).require('child_process');

const LATEST_URL = 'https://api.github.com/repos/bigjk/clai/releases/latest';
const DOWNLOAD_URL = 'https://github.com/bigjk/clai/releases/download';

/**
 * Wrapper for node request
 * @param url URL to fetch
 * @param binary Set to true if you want to fetch a binary
 * @returns Promise
 */
function nodeRequest(url: string, binary: boolean = false): Promise<string | Buffer> {
    return new Promise((resolve, reject) => {
        console.log(`[CLAI] Fetching: ${url}`);
        const req = request(url, {
            headers: {
                'User-Agent': navigator.userAgent
            },
            followRedirects: true
        }, (res: any) => {
            console.log('[CLAI] Response status:', res.statusCode);
            console.log('[CLAI] Response headers:', res.headers);

            if (res.statusCode === 302 || res.statusCode === 301) {
                console.log('[CLAI] Following redirect to:', res.headers.location);
                return nodeRequest(res.headers.location, binary).then(resolve).catch(reject);
            }

            if (binary) {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer) => {
                    console.log('[CLAI] Received chunk of size:', chunk.length);
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    const result = Buffer.concat(chunks);
                    console.log('[CLAI] Final binary size:', result.length);
                    resolve(result);
                });
            } else {
                let data = '';
                res.on('data', (chunk: any) => {
                    console.log('[CLAI] Received text chunk of size:', chunk.length);
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            }
        });

        req.on('error', (error: any) => {
            reject(error);
        });

        req.end();
    });
}

/**
 * Unpacks a tar.gz file
 * @param file Path to the tar.gz file
 * @param outputDir Output directory
 * @returns Promise
 */
function unpackTarGz(file: string, outputDir?: string) {
    return new Promise((resolve, reject) => {
        const args = ['-xzf', file];
        const options = outputDir ? { cwd: outputDir } : undefined;
        childProcess.execFile('tar', args, options, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                console.error('[CLAI] Error:', error);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn('[CLAI] stderr:', stderr);
            }
            console.log('[CLAI] Output:', stdout);
            resolve(stdout);
        });
    });
}

/**
 * Fetches the latest tag from GitHub
 * @returns Promise<string>
 */
async function getLatestTag(): Promise<string> {
    const response = await nodeRequest(LATEST_URL) as string;
    return JSON.parse(response).tag_name;
}

/**
 * Downloads the binary for the given tag, OS and architecture
 * @param tag Tag to download
 * @param os Operating system
 * @param arch Architecture
 * @returns Promise<Buffer>
 */
async function downloadBinary(tag: string, os: string, arch: string): Promise<Buffer> {
    const url = `${DOWNLOAD_URL}/${tag}/clai-${os}-${arch}.tar.gz`;
    return nodeRequest(url, true) as Promise<Buffer>;
}

/**
 * Cleans up old files
 * @param pluginPath Path to the plugin directory
 * @param tarName Name of the tar.gz file
 * @param binaryName Name of the binary file
 */
async function cleanupOldFiles(pluginPath: string, tarName: string, binaryName?: string) {
    const filesToRemove = [tarName, binaryName].filter(Boolean);
    for (const file of filesToRemove) {
        try {
            await fs.promises.rm(`${pluginPath}/${file}`, { force: true });
        } catch (error) {
            console.error(`[CLAI] Error deleting ${file}:`, error);
        }
    }
}

/**
 * Renames the binary file
 * @param pluginPath Path to the plugin directory
 * @param binaryName Name of the binary file
 */
async function renameBinary(pluginPath: string, binaryName: string) {
    try {
        await fs.promises.rename(`${pluginPath}/clai`, `${pluginPath}/${binaryName}`);
    } catch (error) {
        console.error('[CLAI] Error renaming CLAI binary:', error);
    }
}

/**
 * Fetches and installs CLAI
 * @param app Obsidian app
 */
export async function fetchCLAI(app: App) {
    const os = process.platform;
    const arch = process.arch;
    const basePath = (app.vault.adapter as any).basePath;
    const pluginPath = `${basePath}/.obsidian/plugins/clai-obsidian`;
    const binaryName = `clai-${os}-${arch}${os === 'win32' ? '.exe' : ''}`;
    const tarName = `${binaryName}.tar.gz`;

    console.log(`[CLAI] Fetching CLAI for ${os}-${arch}`);

    const latestTag = await getLatestTag();
    const binary = await downloadBinary(latestTag, os, arch);

    await cleanupOldFiles(pluginPath, tarName, binaryName);
    await app.vault.createBinary(`./.obsidian/plugins/clai-obsidian/${tarName}`, binary);

    console.log('[CLAI] Wrote CLAI binary to file');

    await unpackTarGz(`${pluginPath}/${tarName}`, pluginPath);
    await renameBinary(pluginPath, binaryName);
    await cleanupOldFiles(pluginPath, tarName);

    console.log('[CLAI] CLAI binary installed successfully');
}