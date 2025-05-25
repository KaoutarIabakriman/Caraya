# Developer Documentation - Car Rental Management System

This document provides technical details about the implementation of the Car Rental Management System, with a special focus on the image upload functionality.

## Project Structure

```
car-rental-system/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── car.py
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── car.py
│   │   │   ├── upload.py
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── auth_utils.py
│   │   │   └── ...
│   │   └── __init__.py
│   ├── uploads/            # Directory for storing uploaded images
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── cars/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── add/page.tsx
│   │   │   │   ├── edit/[id]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── ...
│   ├── components/
│   │   ├── ImageGallery.tsx
│   │   ├── ImageUpload.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── auth-provider.tsx
│   │   └── ...
│   ├── next.config.js
│   └── package.json
└── README.md
```

## Image Upload Implementation

### Backend Implementation

#### 1. Flask Configuration (`app/__init__.py`)

The Flask application is configured to handle file uploads and serve static files:

```python
# Configure uploads directory
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Serve static files from uploads directory
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
```

#### 2. Upload Routes (`app/routes/upload.py`)

The upload routes handle image uploads and deletions:

```python
@upload_bp.route('/image', methods=['POST'])
@manager_required
def upload_image(user_id):
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Generate a unique filename
        filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file
        file.save(file_path)
        
        # Return the URL to access the file
        file_url = f"/uploads/{filename}"
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'url': file_url
        }), 201
    
    return jsonify({'message': 'File type not allowed'}), 400

@upload_bp.route('/image/<filename>', methods=['DELETE'])
@manager_required
def delete_image(user_id, filename):
    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({'message': 'File not found'}), 404
        
        # Delete the file
        os.remove(file_path)
        
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
```

#### 3. File Validation

Only certain file types are allowed:

```python
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
```

### Frontend Implementation

#### 1. Next.js Configuration (`next.config.js`)

Next.js is configured to allow images from the backend server:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
```

#### 2. Image Upload Component (`components/ImageUpload.tsx`)

This component handles the file selection and upload process:

```typescript
export default function ImageUpload({ onImageUploaded, className = '' }: ImageUploadProps) {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, GIF, or WEBP image.');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('http://localhost:5000/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      // Call the callback with the image URL
      onImageUploaded(`http://localhost:5000${response.data.url}`, response.data.filename);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
}
```

#### 3. Image Gallery Component (`components/ImageGallery.tsx`)

This component displays and manages uploaded images:

```typescript
export default function ImageGallery({ images, onImagesChange, className = '' }: ImageGalleryProps) {
  const { token } = useAuth();
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleDeleteImage = async (index: number) => {
    const image = images[index];
    
    // If this is a newly uploaded image with a filename, delete it from the server
    if (image.filename && image.url.includes('/uploads/')) {
      try {
        setDeletingIndex(index);
        
        // Extract filename from URL if needed
        const filename = image.filename;
        
        await axios.delete(`http://localhost:5000/api/upload/image/${filename}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Error deleting image:', err);
        // Continue with UI update even if server delete fails
      } finally {
        setDeletingIndex(null);
      }
    }
    
    // Update the images array
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };
}
```

#### 4. URL Formatting Helper

A helper function ensures proper URL formatting for image display:

```typescript
const getFullImageUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url;
  } else if (url.startsWith('/uploads/')) {
    return `http://localhost:5000${url}`;
  } else {
    return url;
  }
};
```

#### 5. Image State Management

The car form pages (`add/page.tsx` and `edit/[id]/page.tsx`) manage image state:

```typescript
// State for images
const [images, setImages] = useState<ImageInfo[]>([]);

// Handle image upload
const handleImageUploaded = (url: string, filename: string) => {
  setImages([...images, { url, filename }]);
};

// Form submission includes images
const onSubmit = async (data: CarFormData) => {
  // Extract feature values from feature objects
  const featureValues = data.features.map(feature => feature.value);

  // Add images to the data
  const formData = {
    ...data,
    features: featureValues,
    images: images.map(img => img.url)
  };

  // Submit to API
  const response = await axios.post('http://localhost:5000/api/cars', formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
```

## TypeScript Types

### Image Types

```typescript
// Define image type
interface ImageInfo {
  url: string;
  filename?: string;
}
```

### Feature Types

```typescript
// Define feature type
interface FeatureItem {
  value: string;
  id: string;
}
```

### Car Form Data

```typescript
// Define form schema
const carSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1900, 'Year must be at least 1900').max(new Date().getFullYear() + 1),
  price_per_day: z.coerce.number().positive('Price must be positive'),
  availability_status: z.enum(['available', 'maintenance', 'rented']).default('available'),
  features: z.array(z.object({ value: z.string(), id: z.string() })).default([]),
  description: z.string().optional(),
  // ... other fields
});

type CarFormData = z.infer<typeof carSchema>;
```

## Best Practices Implemented

1. **Security**:
   - File type validation to prevent malicious file uploads
   - File size limits to prevent DoS attacks
   - Secure filename generation to prevent path traversal attacks
   - Authentication for all upload/delete operations

2. **Performance**:
   - Client-side validation before upload
   - Optimized image loading with Next.js Image component
   - Proper error handling and loading states

3. **User Experience**:
   - Visual feedback during upload (loading spinner)
   - Clear error messages
   - Preview of uploaded images
   - Confirmation before deletion

4. **Code Organization**:
   - Reusable components for image upload and gallery
   - Separation of concerns between upload logic and display
   - TypeScript interfaces for type safety

## Future Improvements

1. **Image Optimization**:
   - Implement server-side image resizing and compression
   - Generate thumbnails for faster loading
   - Support for image cropping

2. **Cloud Storage**:
   - Integrate with AWS S3 or similar cloud storage
   - CDN integration for faster image delivery

3. **Enhanced Features**:
   - Drag-and-drop upload interface
   - Multi-file upload
   - Image sorting and reordering
   - Image captions or descriptions 