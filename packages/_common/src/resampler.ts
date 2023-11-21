import { log } from "./logging"

interface ResamplerOptions {
  nativeSampleRate: number
  targetSampleRate: number
  targetFrameSize: number
}

export class Resampler {
  inputBuffer: Array<number>

  constructor(public options: ResamplerOptions) {
    if (options.nativeSampleRate < 16000) {
      log.error(
        "nativeSampleRate is too low. Should have 16000 = targetSampleRate <= nativeSampleRate"
      )
    }
    this.inputBuffer = []
  }

  process = (audioFrame: Float32Array): Float32Array[] => {
    const outputFrames: Float32Array[] = [];
    const maxChunkSize = Math.floor(this.options.targetFrameSize * this.options.targetSampleRate / this.options.nativeSampleRate);

    for (let i = 0; i < audioFrame.length; i += maxChunkSize) {
      const chunk = audioFrame.subarray(i, i + maxChunkSize);
      this.inputBuffer = this.inputBuffer.concat(Array.from(chunk));

      while (this.inputBuffer.length >= this.options.targetFrameSize) {
        const outputFrame = this.inputBuffer.slice(0, this.options.targetFrameSize);
        this.inputBuffer = this.inputBuffer.slice(this.options.targetFrameSize);
        outputFrames.push(outputFrame as any);
      }
    }

    return outputFrames;
  }
}
