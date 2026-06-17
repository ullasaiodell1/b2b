import axios from './httpRequest';

// POST /files/uploads — upload single file
export const uploadFile = (data: { uri: string; type?: string; fileName?: string } | string,): Promise<any> => {
    const url = '/files/uploads';
    const fileUri = typeof data === 'string' ? data : data.uri;
    const fileType = typeof data === 'string' ? 'image/jpeg' : (data.type || 'image/jpeg');
    const fileName = typeof data === 'string' ? (fileUri.split('/').pop() || 'upload.jpg') : (data.fileName || 'upload.jpg');
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
    });
    return axios({
        method: 'POST',
        url,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
const guessMimeType = (uri: string) => {
    const ext = uri.split(".").pop()?.toLowerCase();
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "png") return "image/png";
    if (ext === "m4a") return "audio/m4a";
    if (ext === "mp3") return "audio/mpeg";
    return "application/octet-stream";
};

// POST /files/uploads/multiple — upload multiple files
export const uploadMulptipleFiles = (files: any) => {
    const formData = new FormData();
    files.forEach((uri: string, i: number) => {
        const ext = uri.split(".").pop() || "bin";
        formData.append("files", {
            uri,
            name: `upload_${i}.${ext}`,
            type: guessMimeType(uri),
        } as any);
    });
    return axios({
        method: "POST",
        url: "/files/uploads/multiple",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
    }) as Promise<{ url: string; key: string }>;
};