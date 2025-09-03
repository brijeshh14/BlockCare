
const IPFS_API_URL = 'http://localhost:5001/api/v0';
const IPFS_GATEWAY_URL = 'http://localhost:8080/ipfs';

export interface IPFSUploadResult {
  hash: string;
  size: number;
}


export async function uploadTextToIPFS(text: string): Promise<IPFSUploadResult> {
  const blob = new Blob([text], { type: 'text/plain' });
  const file = new File([blob], 'text.txt', { type: 'text/plain' });
  
  return uploadFileToIPFS(file);
}

export async function uploadFileToIPFS(file: File): Promise<IPFSUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${IPFS_API_URL}/add?pin=true`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const lines = result.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  const data = JSON.parse(lastLine);
  
  return {
    hash: data.Hash,
    size: data.Size || file.size
  };
}


export function getIPFSUrl(hash: string): string {
  return `${IPFS_GATEWAY_URL}/${hash}`;
}

export async function checkIPFSConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${IPFS_API_URL}/version`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('IPFS connection check failed:', error);
    return false;
  }
}
