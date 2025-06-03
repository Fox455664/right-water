import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, KeyRound, Edit3, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { updateProfile } from 'firebase/auth';

const UserProfilePage = () => {
  const { currentUser, loading, updateUserPassword, reauthenticateUser } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setNameLoading(true);
    try {
      await updateProfile(currentUser, { displayName });
      toast({
        title: "✅ تم تحديث الاسم",
        description: "تم تحديث اسمك بنجاح.",
        className: "bg-green-500 text-white",
      });
      setIsEditingName(false);
    } catch (error) {
      toast({
        title: "❌ خطأ في تحديث الاسم",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "كلمتا المرور غير متطابقتين",
        description: "يرجى التأكد من تطابق كلمة المرور الجديدة وتأكيدها.",
        variant: "destructive",
      });
      return;
    }
    if (!currentPassword) {
        toast({
            title: "كلمة المرور الحالية مطلوبة",
            description: "يرجى إدخال كلمة المرور الحالية للمتابعة.",
            variant: "destructive",
        });
        return;
    }

    setPasswordLoading(true);
    try {
      await reauthenticateUser(currentPassword);
      await updateUserPassword(newPassword);
      toast({
        title: "🔑 تم تغيير كلمة المرور بنجاح",
        description: "تم تحديث كلمة المرور الخاصة بك.",
        className: "bg-green-500 text-white",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/wrong-password') {
        errorMessage = "كلمة المرور الحالية غير صحيحة. يرجى المحاولة مرة أخرى.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "كلمة المرور الجديدة ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.";
      }
      toast({
        title: "❌ خطأ في تغيير كلمة المرور",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 max-w-2xl"
    >
      <Card className="shadow-xl glassmorphism-card overflow-hidden">
        <CardHeader className="bg-primary/10 p-8 text-center">
          <User className="mx-auto h-20 w-20 text-primary mb-4 p-3 bg-primary/20 rounded-full" />
          <CardTitle className="text-3xl font-bold text-primary">الملف الشخصي</CardTitle>
          <CardDescription className="text-muted-foreground">
            إدارة معلومات حسابك وتفضيلات الأمان.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Display Name Section */}
          <form onSubmit={handleNameUpdate} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <User className="ml-2 h-5 w-5 text-primary" /> معلومات الحساب
            </h3>
            <div>
              <Label htmlFor="displayName" className="text-muted-foreground">الاسم المعروض</Label>
              <div className="flex items-center space-x-2 space-x-reverse mt-1">
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditingName || nameLoading}
                  className="bg-background/70 border-primary/30 focus:border-primary"
                />
                {!isEditingName ? (
                  <Button type="button" variant="outline" size="icon" onClick={() => setIsEditingName(true)} className="border-primary text-primary hover:bg-primary/10">
                    <Edit3 className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button type="submit" variant="default" size="icon" disabled={nameLoading} className="bg-primary hover:bg-primary/90">
                    {nameLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-muted-foreground">البريد الإلكتروني</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>
          </form>

          <hr className="border-border/50" />

          {/* Change Password Section */}
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <KeyRound className="ml-2 h-5 w-5 text-primary" /> تغيير كلمة المرور
            </h3>
             <div>
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                placeholder="6 أحرف على الأقل"
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">تأكيد كلمة المرور الجديدة</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                placeholder="أعد كتابة كلمة المرور الجديدة"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري تحديث كلمة المرور...
                </>
              ) : (
                "تحديث كلمة المرور"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="p-6 bg-primary/5 text-center">
            <p className="text-xs text-muted-foreground">
                لأمان حسابك، لا تشارك كلمة المرور الخاصة بك مع أي شخص.
            </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default UserProfilePage;
