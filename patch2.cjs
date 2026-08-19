const fs = require('fs');

function patchFile() {
  const filePath = 'src/components/ServiceManagement/CreateService.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add imports
  if (!content.includes('ImageCropModal')) {
    content = content.replace(
      "import { CustomSelect } from '../common/CustomSelect';",
      "import { CustomSelect } from '../common/CustomSelect';\nimport { ImageCropModal } from '../common/ImageCropModal';\nimport { ServiceCard } from '../common/ServiceCard';"
    );
  }

  // 2. Add crop state and handlers
  if (!content.includes('cropModalOpen')) {
    content = content.replace(
      "const handleInputChange = (field: string, value: string | boolean) => {",
      `// Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {`
    );
  }

  if (!content.includes('handleFileSelect')) {
    content = content.replace(
      "const handleImageUpload = async (file: File) => {",
      `const handleFileSelect = (file: File) => {
    setRawSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setRawPreviewUrl(objectUrl);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {
    setUploadingImage(true);
    try {
      setImagePreview(croppedPreviewUrl);
      const url = await uploadImage(croppedFile);
      handleInputChange('image', url);
      toast.success('Image cropped and uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (file: File) => {`
    );
  }

  // 3. Update onChange to handleFileSelect
  content = content.replace(
    /handleImageUpload\(file\);/g,
    "handleFileSelect(file);"
  );

  // 4. Update the preview markup
  const previewRegex = /<div className="flex items-start gap-6">[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/;
  const newPreview = `<div className="flex justify-center md:justify-start">
                    <ServiceCard
                      image={imagePreview || undefined}
                      title={formData.name || 'Untitled Service'}
                      className="w-full sm:w-85"
                    />
                  </div>`;
  content = content.replace(previewRegex, newPreview);

  // 5. Append ImageCropModal if not present
  if (!content.includes('<ImageCropModal')) {
    const endStr = `      </div>
    </div>
  );
}`;
    const newEndStr = `      </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPreviewUrl}
        file={rawSelectedFile}
        aspectRatio={1}
        outputWidth={340}
        outputHeight={340}
        isCircular={false}
        onClose={() => {
          setCropModalOpen(false);
          setRawSelectedFile(null);
          setRawPreviewUrl(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}`;
    content = content.replace(endStr, newEndStr);
  }

  fs.writeFileSync(filePath, content);
  console.log('Patched CreateService.tsx successfully');
}

patchFile();
