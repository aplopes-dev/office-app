import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">File Management System</h1>
      <div className="space-y-8">
        <FileUpload />
        <FileList />
      </div>
    </div>
  );
}