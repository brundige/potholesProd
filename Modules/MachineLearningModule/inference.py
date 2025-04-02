import os
import argparse
import yaml
from ultralytics import YOLO


def inference(source_images, output_dir):
    print(f"Running inference on: {source_images} from python script")
    os.makedirs(output_dir, exist_ok=True)
    model = YOLO('Modules/MachineLearningModule/models/v17_Chatt_only_800__aspect_expandedDataset_yolo11x.pt',
                 task='detect')

    # Load the best hyperparameters from the YAML file  -- todo: perfrom hyperparameter tuning

    # with open(
    #         "C:\\Users\\chrisb\\chattanooga_test\\potholes_machine_learning\\model_builder\\runs\\detect\\tune\\best_hyperparameters.yaml",
    # $         'r') as file:
    #      best_hyperparameters = yaml.load(file, Loader=yaml.FullLoader)

    # $    model.overrides.update(best_hyperparameters)

    results = model.predict(
        source=source_images,
        #vid_stride=12,
        show=True,
        classes=[2, 4, 6],
        save=True,
        stream=False,
        save_frames=True,
        show_labels=True,
        save_txt=True,
        save_conf=True,
        imgsz=800,  # Uncommented this line - can be an integer or list like [800, 800]
        conf=0.3,
        device='cuda:0',
        project=output_dir,
        name='predictions'
    )

    for result in results:
        print(result)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run inference on a directory of images.')
    parser.add_argument('source_images', type=str, help='Path to the directory of source images')
    parser.add_argument('output_dir', type=str, help='Directory to save images with predictions')

    args = parser.parse_args()
    inference(args.source_images, args.output_dir)
