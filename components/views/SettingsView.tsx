"use client"

import { useState, useEffect } from "react"
import { Settings, User, Lock, Info, Loader2, Save, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function SettingsView() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [displayName, setDisplayName] = useState("")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "")
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) {
      toast({
        title: "Error",
        description: "Display name is required",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingProfile(true)
    
    try {
      await updateProfile(user, {
        displayName: displayName.trim()
      })
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)
    
    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Update password
      await updatePassword(user, newPassword)
      
      toast({
        title: "Success",
        description: "Password updated successfully!",
      })
      
      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error('Error updating password:', error)
      let errorMessage = "Failed to update password"
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Current password is incorrect"
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "New password is too weak"
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#8B5CF6]" />
          <p className="text-[#9CA3AF]">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]">
      <header className="border-b border-[#374151]/30 bg-[#111111]/80 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#E5E7EB] bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-[#9CA3AF] mt-1 text-lg">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-screen-xl mx-auto space-y-8">
          <div className="grid gap-8 max-w-4xl">
            {/* Profile Settings */}
            <Card className="bg-[#111111]/80 border-[#374151]/30 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-50 text-xl">
                  <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Profile Settings
                </CardTitle>
                <p className="text-[#9CA3AF] text-sm">Update your display name and personal information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-slate-200 text-sm font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-slate-200 placeholder:text-[#6B7280] h-12"
                  />
                </div>
                
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile || !displayName.trim() || displayName === user?.displayName}
                  className="w-full h-12 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Update Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card className="bg-[#111111]/80 border-[#374151]/30 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-50 text-xl">
                  <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-lg">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  Password Settings
                </CardTitle>
                <p className="text-[#9CA3AF] text-sm">Change your account password</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="currentPassword" className="text-slate-200 text-sm font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-slate-200 placeholder:text-[#6B7280] h-12"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="newPassword" className="text-slate-200 text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-slate-200 placeholder:text-[#6B7280] h-12"
                    />
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => {
                            let color = 'bg-[#374151]'
                            if (newPassword.length >= 6) color = 'bg-green-500'
                            else if (newPassword.length >= 4) color = 'bg-yellow-500'
                            else if (newPassword.length >= 2) color = 'bg-red-500'
                            
                            return (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded transition-colors ${color}`}
                              />
                            )
                          })}
                        </div>
                        <p className={`text-xs ${
                          newPassword.length >= 6 ? 'text-green-400' : 
                          newPassword.length >= 4 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {newPassword.length >= 6 ? 'Strong password' : 
                           newPassword.length >= 4 ? 'Medium strength' : 
                           'Weak password'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-slate-200 text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20 text-slate-200 placeholder:text-[#6B7280] h-12"
                  />
                </div>
                
                <Button
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full h-12 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-[#111111]/80 border-[#374151]/30 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-50 text-xl">
                  <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-lg">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  Account Information
                </CardTitle>
                <p className="text-[#9CA3AF] text-sm">Your account details and statistics</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[#9CA3AF] text-sm font-medium">Email Address</Label>
                    <p className="text-slate-200 font-medium text-lg">{user?.email}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[#9CA3AF] text-sm font-medium">User ID</Label>
                    <p className="text-slate-200 font-mono text-sm bg-[#1A1A1A] p-2 rounded border border-[#374151]">
                      {user?.uid}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[#9CA3AF] text-sm font-medium">Account Created</Label>
                  <p className="text-slate-200 font-medium">
                    {user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Unknown'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[#9CA3AF] text-sm font-medium">Last Sign In</Label>
                  <p className="text-slate-200 font-medium">
                    {user?.metadata?.lastSignInTime ? 
                      new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Unknown'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
