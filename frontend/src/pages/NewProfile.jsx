import  { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "@radix-ui/react-icons";
import { newProfileSchema } from "../validation/auth.validation";
import { useProfileUploader } from "../utils/queries";
import { useNotification } from "../hooks/useNotification";
import { Spinner } from "@mynaui/icons-react";
import {useDispatch} from "react-redux"

export const ProfileUploader = () => {
  // State to hold the selected image file and its preview URL.
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  // State to hold the form data (full name and about text).
  const [formData, setFormData] = useState({
    fullName: "",
    about: "",
  });

  const [isMainLoading, setIsMainLoading] = useState(false);
  const profileUploaderMutation = useProfileUploader();
  const notify = useNotification();

  const fileInputRef = useRef(null);

  // This useEffect hook handles cleaning up the temporary image URL.
  // When the component unmounts or the image changes, the old URL is revoked
  // to free up memory.
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        notify.notify("Please select a valid image file (JPEG, PNG, or WebP)", "top-center", "error");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        notify.notify("Image size must be less than 5MB", "top-center", "error");
        return;
      }

      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if profile image is selected FIRST - before any loading state
    if (!imageFile) {
      notify.notify("Please select a profile image", "top-center", "error");
      return;
    }

    // Validate the form data
    try {
      await newProfileSchema.validateAsync(formData, {
        abortEarly: false,
      });
    } catch (error) {
      console.error("Validation errors:", error.details);
      const errorMessages = error.details.map((detail) => detail.message);
      errorMessages.forEach((msg) => {
        notify.notify(msg, "top-center", "error");
      });
      return;
    }

    // Only set loading state after all validations pass
    setIsMainLoading(true);

    console.log("Form Submitted!", {
      name: formData.fullName,
      about: formData.about,
      profileImage: imageFile,
    });
    
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.fullName);
    formDataToSend.append("about", formData.about);
    formDataToSend.append("profileImage", imageFile);

    profileUploaderMutation.mutate(formDataToSend, {
      onSuccess: (data) => {
        setIsMainLoading(false);
        console.log(data);
        notify.notify("Profile updated successfully!", "top-center", "success");
        // You can redirect to dashboard or another page here if needed
      },
      onError: (error) => {
        setIsMainLoading(false);
        console.error("Error uploading profile:", error);
        const errorMessage = error?.response?.data?.message || "Failed to upload profile";
        notify.notify(errorMessage, "top-center", "error");
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-muted via-muted to-muted/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.05),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,226,0.05),transparent_50%)]"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl hover:shadow-3xl transition-all duration-300 border-border/50 bg-background/95 backdrop-blur-sm rounded-xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Add your photo and personal details to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Enhanced avatar section */}
            <div className="flex flex-col items-center gap-6">
              {/* The hidden file input element */}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Enhanced interactive avatar component */}
              <div
                onClick={handleAvatarClick}
                className="relative cursor-pointer group w-32 h-32 transition-all duration-300 hover:scale-105"
              >
                <Avatar className="w-full h-full border-4 border-white shadow-xl ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                  <AvatarImage
                    src={
                      imagePreview ||
                      "https://placehold.co/150x150/E2E8F0/1E293B?text=P"
                    }
                    alt="Profile Picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground text-2xl font-bold">
                    CN
                  </AvatarFallback>
                </Avatar>
                {/* Enhanced overlay for the upload icon */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm
                             opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"
                >
                  <CameraIcon className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                {/* Upload indicator ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Enhanced image upload instruction */}
              <div className="text-center space-y-1">
                {imageFile ? (
                  <p className="text-sm font-medium text-green-600 flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Image selected successfully
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-500 flex items-center gap-2 justify-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Profile image required
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click the avatar to upload (JPEG, PNG, WebP • Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced form fields */}
            <div className="space-y-6">
              {/* Enhanced Full Name Input Field */}
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="h-11 px-4 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              {/* Enhanced About Textarea Field */}
              <div className="space-y-3">
                <Label htmlFor="about" className="text-sm font-medium text-foreground">
                  About You <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="about"
                  name="about"
                  placeholder="Tell us a little bit about yourself..."
                  value={formData.about}
                  onChange={handleInputChange}
                  rows={4}
                  className="px-4 py-3 rounded-lg border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Share your interests, hobbies, or what makes you unique
                </p>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <Button 
              type="submit" 
              disabled={isMainLoading} 
              className="w-full h-12 rounded-lg font-medium bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {isMainLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="animate-spin" size={18} />
                  Saving Profile...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Save Profile
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileUploader;
