// Path: helpers/googleCloudServices.js

const path = require('path');
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');
const { LanguageServiceClient } = require('@google-cloud/language');
const { Storage } = require('@google-cloud/storage');
const bucketName = 'liquidhiring-bucket';

const google_cloud_credentials = {
    projectId: 'optical-psyche-364715',
    keyFilename: path.join(__dirname, '../optical-psyche-364715-f1bcf3a6d6d4.json'),
}

const storage = new Storage(google_cloud_credentials);

const processDocument = async (bucketName, fileName, fileContent) => {
    const client = new DocumentProcessorServiceClient(google_cloud_credentials)
    const projectId = 'optical-psyche-364715';
    const location = 'us';
    const processorId = 'd31929f4f411ac94';
    const processorName = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    const gcsInputUri = `gs://${bucketName}/${fileName}`;

    const inputConfig = {
        gcsDocumentUri: gcsInputUri,
    };
    const document = {
        content: fileContent.toString('base64'), // Change this line to encode the content as base64
        mimeType: 'application/pdf', // Adjust the mimeType based on the type of your document
    };
    const request = {
        name,
        rawDocument: document, // Pass the document with the content instead of inputConfig
    };
    let response;
    try {
        [response] = await client.processDocument(request);
    } catch (error) {
        console.log("Error processing document:", error);
        throw error;  // or return some default value
    }
    return response.document.text;
};

const analyzeText = async (text) => {
    const client = new LanguageServiceClient(google_cloud_credentials);
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };

    const [result] = await client.analyzeSyntax({ document });

    const tokens = result.tokens.map(token => ({
        content: token.text.content,
        pos: token.partOfSpeech.tag
    }));
    // Print tokens
    console.log('Tokens:');
    tokens.forEach(token => console.log(`${token.pos}: ${token.content}`));
    return tokens;
}

module.exports = {
    processDocument,
    analyzeText,
    storage,
    bucketName,
};