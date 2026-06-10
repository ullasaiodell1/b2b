export interface CameraResult {
  uri: string;
  target?: string;
  extra?: any;
}

export let cameraResult: CameraResult | null = null;

export const setCameraResult = (result: CameraResult | null) => {
  cameraResult = result;
};
