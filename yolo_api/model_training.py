from multiprocessing import freeze_support

if __name__ == '__main__':
    freeze_support()
    from ultralytics import YOLO
    
    # 加载预训练模型
    model = YOLO('yolov8s.pt')
    
    # 训练模型
    model.train(
        data='C:/Users/ASUS/training1104/trainCat/set.yaml',  # 训练数据集的配置文件
        epochs=100,  # 训练轮数
        batch=16,  # 批次大小
        imgsz=640,  # 图片大小
        workers=4,  # 使用多个工作线程加速数据加载
        device=0,  # 使用 GPU 设备编号，若为 CPU 则使用 'cpu'
        val=True  # 每轮训练后自动验证
    )

    # 保存训练后的模型
    model.save('cat_and_ear_model_before_val.pt')

    # 进行模型验证，指定数据集配置文件路径，避免使用 COCO 数据集
    results = model.val(data='C:/Users/ASUS/training1104/trainCat/set.yaml')

    # 打印所有的验证结果以查看其结构
    print(results)

    # 提取平均结果（返回 precision, recall, map50, map 等）
    precision, recall, map50, map, *_ = results.mean_results()

    # 打印这些指标
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"mAP@0.5: {map50:.4f}")
    print(f"mAP@0.5:0.95: {map:.4f}")

    # 保存验证后的模型
    model.save('cat_and_ear_model_after_val.pt')
