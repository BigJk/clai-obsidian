import { App } from 'obsidian';
import { CLAISettings } from '../types';

// @ts-ignore
const process = (window as any).require('process');

// @ts-ignore
const childProcess = (window as any).require('child_process');

/**
 * Runs CLAI
 * @param settings CLAI settings
 * @param file The file to run CLAI on
 * @param userInput The user input
 * @param app The Obsidian app
 * @param opts Options for running CLAI
 * @returns The output of CLAI
 */
export async function runCLAI(settings: CLAISettings, file: string, userInput: any, app: App, opts?: { dry: boolean }): Promise<string> {
    process.env.CLAI_URL = settings.url;
    process.env.CLAI_APIKEY = settings.apiKey;
    process.env.CLAI_MODEL = settings.model;

    console.log(`[CLAI] Running CLAI on file: ${file} with input: ${JSON.stringify(userInput)}`);

    // Get the vault's base path
    const basePath = (app.vault.adapter as any).basePath;

    return new Promise((resolve, reject) => {
        childProcess.execFile(
            basePath + `/.obsidian/plugins/clai-obsidian/clai-${process.platform}-${process.arch}${process.platform === 'win32' ? '.exe' : ''}`,
            ['run', ...(opts?.dry ? ['--dry'] : []), file, JSON.stringify(userInput)],
            { cwd: basePath },
            (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    console.error('[CLAI] Error:', error);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.warn('[CLAI] stderr:', stderr);
                }
                console.log('[CLAI] Output:', stdout);
                resolve(stdout as string);
            }
        );
    });
}

/**
 * Runs CLAI version
 * @param app The Obsidian app
 * @returns The version of CLAI
 */
export async function runCLAIVersion(app: App): Promise<string> {
    // Get the vault's base path
    const basePath = (app.vault.adapter as any).basePath;

    return new Promise((resolve, reject) => {
        childProcess.execFile(
            basePath + `/.obsidian/plugins/clai-obsidian/clai-${process.platform}-${process.arch}${process.platform === 'win32' ? '.exe' : ''}`,
            ['version'],
            { cwd: basePath },
            (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    console.error('[CLAI] Error:', error);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.warn('[CLAI] stderr:', stderr);
                }
                console.log('[CLAI] Output:', stdout);
                resolve(stdout as string);
            }
        );
    });
}