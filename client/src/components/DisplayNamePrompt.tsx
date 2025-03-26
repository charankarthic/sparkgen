import { useAuth } from "@/contexts/AuthContext";
import { ProfileNameDialog } from "@/components/ProfileNameDialog";
import { useToast } from "@/hooks/useToast";

export function DisplayNamePrompt() {
  const { userId, needsDisplayName, setNeedsDisplayName, updateDisplayName } = useAuth();
  const { toast } = useToast();

  const handleProfileNameUpdate = async (newName?: string) => {
    if (newName) {
      try {
        await updateDisplayName(newName);
        toast({
          title: "Success",
          description: "Your profile name has been updated!",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
        });
      }
    }
    setNeedsDisplayName(false);
  };

  if (!userId || !needsDisplayName) {
    return null;
  }

  return (
    <ProfileNameDialog
      userId={userId}
      open={needsDisplayName}
      onClose={handleProfileNameUpdate}
    />
  );
}