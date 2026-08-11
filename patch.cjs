const fs = require('fs');
let content = fs.readFileSync('src/components/ServiceManagement/CreateService.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { ImageCropModal } from '../common/ImageCropModal';",
  "import { ImageCropModal } from '../common/ImageCropModal';\nimport { ServiceCard } from '../common/ServiceCard';"
);

// 2. Add crop state
content = content.replace(
  "const handleInputChange = (field: string, value: string | boolean) => {",
  "// Crop state\n  const [cropModalOpen, setCropModalOpen] = useState(false);\n  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);\n  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);\n\n  const handleInputChange = (field: string, value: string | boolean) => {"
);

// 3. Add crop handlers
content = content.replace(
  "  const handleImageUpload = async (file: File) => {",
  "  const handleFileSelect = (file: File) => {\n    setRawSelectedFile(file);\n    const objectUrl = URL.createObjectURL(file);\n    setRawPreviewUrl(objectUrl);\n    setCropModalOpen(true);\n  };\n\n  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {\n    setUploadingImage(true);\n    try {\n      setImagePreview(croppedPreviewUrl);\n      const url = await uploadImage(croppedFile);\n      handleInputChange('image', url);\n      toast.success('Image cropped and uploaded successfully!');\n    } catch (error) {\n      console.error('Error uploading image:', error);\n      toast.error('Failed to upload image. Please try again.');\n      setImagePreview(null);\n    } finally {\n      setUploadingImage(false);\n    }\n  };\n\n  const handleImageUpload = async (file: File) => {"
);

// 4. Update file input onChange
content = content.replace(
  "handleImageUpload(file);",
  "handleFileSelect(file);"
);

// 5. Replace preview with ServiceCard
content = content.replace(
  /<div className="flex items-start gap-6">[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/,
  '<div className="flex justify-center md:justify-start">\n                    <ServiceCard\n                      image={imagePreview || undefined}\n                      title={formData.name || \'Untitled Service\'}\n                      className="w-full sm:w-[340px]"\n                    />\n                  </div>'
);

// 6. Append ImageCropModal
content = content.replace(
  "      </div>\n    </div>\n  );\n}",
  "      </div>\n\n      <ImageCropModal\n        isOpen={cropModalOpen}\n        imageSrc={rawPreviewUrl}\n        file={rawSelectedFile}\n        aspectRatio={1}\n        outputWidth={340}\n        outputHeight={340}\n        isCircular={false}\n        onClose={() => {\n          setCropModalOpen(false);\n          setRawSelectedFile(null);\n          setRawPreviewUrl(null);\n        }}\n        onCropComplete={handleCropComplete}\n      />\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/ServiceManagement/CreateService.tsx', content);
console.log('Patched successfully');
