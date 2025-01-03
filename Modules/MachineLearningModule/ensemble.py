import os
import argparse
from ultralytics import YOLO
import yaml

# Load Base Model
base_model = YOLO('Modules/MachineLearningModule/models/11n_eleven_thirteen_150epochs.pt', task='detect')
# Load Manhole Model
manhole_model = YOLO('Modules/MachineLearningModule/base_transfer_manhole.pt', task='detect')
# Load the best hyperparameters from the YAML file
with open(
        "C:/Users/chrisb/chattanooga_test/potholes_machine_learning/model_builder/runs/detect/tune/best_hyperparameters.yaml",
        'r') as file:
    best_hyperparameters = yaml.load(file, Loader=yaml.FullLoader)


def run_model(model, source_images, classes, project, output_dir, hp=best_hyperparameters,):
    # Set the hyperparameters directly in the model's configuration
    model.overrides.update(hp)

    # Predict on the frames and save the results
    results = model.predict(
        source=source_images,
        vid_stride=15,
        show=True,
        classes=classes,
        save=True,
        stream=False,
        save_frames=True,
        show_labels=True,
        save_txt=True,
        save_conf=True,
        conf=0.3,
        device='cuda:0',
        project=os.path.join(output_dir, project),

    )

    return results


def labels_to_dict(dir_to_convert):
    labels_dict = {}
    for filename in os.listdir(dir_to_convert):
        if filename.endswith('.txt'):
            with open(os.path.join(dir_to_convert, filename), 'r') as f:
                lines = f.readlines()
                labels_dict[filename] = [line.strip() for line in lines]
    return labels_dict


def majority_voting(base_predictions_path, manhole_results_path):
    # Convert Base Ps to Dictionary
    base_predictions = labels_to_dict(base_predictions_path)

    # Find results for manhole model that are in the base model
    for frame in os.listdir(manhole_results_path):
        # If the frame is in the base model
        if base_predictions.get(frame):
            with open(os.path.join(manhole_results_path, frame), 'r') as f:
                lines = [line.strip() for line in f.readlines()]

            for prediction_label in base_predictions[frame]:
                for manhole_label in lines:
                    prediction_data = prediction_label.split()
                    manhole_data = manhole_label.split()

                    try:
                        if round(float(prediction_data[1]), 2) == round(float(manhole_data[1]), 2) and round(
                                float(prediction_data[2]), 2) == round(float(manhole_data[2]), 2) and \
                                prediction_data[0] != manhole_data[0]:
                            print(f"frame{frame}")
                            print(f"Match: {prediction_data} and {manhole_data}")
                            print('\n')

                            # Change the label to 4
                            base_predictions[frame].remove(prediction_label)
                            base_predictions[frame].append('4 ' + ' '.join(prediction_data[1:]))

                            print(f"New label: {base_predictions[frame]}")
                            print('\n')

                    except ValueError:
                        print(f"Invalid data in frame {frame}: {prediction_label} or {manhole_label}")

    return base_predictions


def inference(source_images, output_dir):
    print(f"Running inference on: {source_images} from python script")
    os.makedirs(output_dir, exist_ok=True)

    run_model(base_model, source_images, classes=[2, 4, 6], project='base', output_dir=output_dir)
    run_model(manhole_model, source_images, classes=[4], project='manhole', output_dir=output_dir)
    updated_predictions = majority_voting(os.path.join(output_dir, 'base'), os.path.join(output_dir, 'manhole'))

    # Write the dictionary back to the labels directory (output_dir in production)
    for filename, labels in updated_predictions.items():
        with open(os.path.join(output_dir, filename), 'w') as f:
            for label in labels:
                f.write(label + '\n')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run inference on a directory of images.')
    parser.add_argument('source_images', type=str, help='Path to the directory of source images')
    parser.add_argument('output_dir', type=str, help='Directory to save images with predictions')
    args = parser.parse_args()
    inference(args.source_images, args.output_dir)