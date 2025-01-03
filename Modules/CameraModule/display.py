import argparse
from ultralytics import YOLO


def inference(video_source):
    model = YOLO('Modules/MachineLearningModule/models/11n_eleven_thirteen_150epochs.pt', task='detect')

    results = model(source=video_source, vid_stride=1, classes=[2, 4, 6], stream=True, show=True, save_conf=True,
                    device="cuda:0", conf=0.3, name='predictions')
    for result in results:
        results = {"inference": "result data"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run inference on a directory of images.')
    parser.add_argument('video_source', type=str, help='Path to the directory of source images')

    args = parser.parse_args()
    inference(args.video_source)
