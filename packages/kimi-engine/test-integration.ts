
import dotenv from 'dotenv';
import { KimiEngine } from './index';

dotenv.config({ path: '../../.env' });

async function testEngine() {
    console.log('Starting Kimi Engine Test...');
    console.log('NVIDIA_BASE_URL:', process.env.NVIDIA_BASE_URL);

    const engine = new KimiEngine();

    try {
        const response = await engine.execute(
            [
                { role: 'user', content: 'Hello Kimi! Please confirm that you are working and can think.' }
            ],
            []
        );

        console.log('Response received:');
        console.log(JSON.stringify(response, null, 2));

        if (response.content) {
            console.log('\n--- SUCCESS ---');
            console.log('Integration test passed.');
        } else {
            console.log('\n--- FAILED ---');
            console.log('Received empty content in response.');
        }
    } catch (error) {
        console.error('\n--- ERROR ---');
        console.error('Test failed with error:', error);
    }
}

testEngine();
