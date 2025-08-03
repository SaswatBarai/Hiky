import React, { useState, useRef, useEffect } from "react";
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-muated">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Add Profile</CardTitle>
          <CardDescription>
            Update your photo and personal details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              {/* The hidden file input element */}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {/* The interactive avatar component */}
              <div
                onClick={handleAvatarClick}
                className="relative cursor-pointer group w-28 h-28"
              >
                <Avatar className="w-full h-full border-4 border-white shadow-md">
                  <AvatarImage
                    src={
                      imagePreview ||
                      "https://placehold.co/150x150/E2E8F0/1E293B?text=P"
                    }
                    alt="Profile Picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-800 text-xl font-semibold">
                    CN
                  </AvatarFallback>
                </Avatar>
                {/* Overlay for the upload icon */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 
                             opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <CameraIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Image upload instruction */}
              <p className="text-sm text-muted-foreground text-center">
                {imageFile ? (
                  <span className="text-green-600">✓ Image selected</span>
                ) : (
                  <span className="text-red-500">* Profile image required</span>
                )}
              </p>
            </div>

            {/* Full Name Input Field */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                className="rounded-md"
              />
            </div>

            {/* About Textarea Field */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                name="about"
                placeholder="Tell us a little bit about yourself."
                value={formData.about}
                onChange={handleInputChange}
                rows={4}
                className="rounded-md resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isMainLoading} className="w-full rounded-md">
              {isMainLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="animate-spin" size={16} />
                  Uploading...
                </div>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileUploader;
