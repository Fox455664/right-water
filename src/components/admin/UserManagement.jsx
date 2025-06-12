import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { db, collection, getDocs, orderBy as firestoreOrderBy, query as firestoreQuery, doc, updateDoc, deleteDoc } from '@/firebase';
import { Loader2, Users, Search, MoreHorizontal, Edit2, Trash2, KeyRound, UserX, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth'; // تأكد من أن هذا المسار صحيح

// تعريف معرّف الأدمن الخارق (UID)
const SUPER_ADMIN_UID = 'hoIGjbMl4AbEEX4LCQeTx8YNfXB2';

const UserManagement = () => {
  const { user: loggedInUser } = useAuth();
  const auth = getAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editFormData, setEditFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    role: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = firestoreQuery(collection(db, 'users'), firestoreOrderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast({ title: "خطأ في تحميل المستخدمين", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    if (!currentUser) return;

    if (editFormData.role !== currentUser.role && loggedInUser?.uid !== SUPER_ADMIN_UID) {
      toast({
        title: "غير مصرح لك",
        description: "لا يمكنك تغيير أدوار المستخدمين. هذه الصلاحية للأدمن الخارق فقط.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, editFormData);
      toast({ title: "تم تحديث المستخدم بنجاح" });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user: ", error);
      toast({ title: "خطأ في تحديث المستخدم", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'users', currentUser.id));
      toast({ title: "تم حذف المستخدم بنجاح" });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user: ", error);
      toast({ title: "خطأ في حذف المستخدم", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResetModal = (user) => {
    setCurrentUser(user);
    setIsResetModalOpen(true);
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      toast({
        title: "تم إرسال الرابط بنجاح",
        description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${currentUser.email}.`,
      });
      setIsResetModalOpen(false);
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      toast({ title: "حدث خطأ", description: "لم نتمكن من إرسال البريد. يرجى المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  const filteredUsers = users.filter(user =>
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.phone && user.phone.includes(searchTerm))
  );

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 md:px-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 flex items-center">
          <Users className="mr-3 rtl:ml-3 rtl:mr-0" size={32}/>
          إدارة المستخدمين
        </h1>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* --- بداية الجزء الذي تم إصلاحه --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserX className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-xl text-slate-600 dark:text-slate-400">لم يتم العثور على مستخدمين.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
              <TableRow>
                <TableHead className="text-right px-3 py-3.5">الاسم</TableHead>
                <TableHead className="text-right px-3 py-3.5">البريد الإلكتروني</TableHead>
                <TableHead className="text-right px-3 py-3.5">الهاتف</TableHead>
                <TableHead className="text-right px-3 py-3.5">الدور</TableHead>
                <TableHead className="text-right px-3 py-3.5">تاريخ التسجيل</TableHead>
                <TableHead className="text-center px-3 py-3.5">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <TableCell className="font-medium px-3 py-4">{user.displayName || '-'}</TableCell>
                  <TableCell className="px-3 py-4">{user.email}</TableCell>
                  <TableCell className="px-3 py-4">{user.phone || '-'}</TableCell>
                  <TableCell className="px-3 py-4">
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role === 'admin' ? 'مدير' : 'عميل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-4">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-center px-3 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetModal(user)}>
                          <KeyRound className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> إعادة تعيين كلمة المرور
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteModal(user)} className="text-red-600 focus:text-red-600 dark:focus:text-red-400">
                          <Trash2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* --- نهاية الجزء الذي تم إصلاحه --- */}


      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-displayName" className="text-right col-span-1">الاسم</Label>
              <Input id="edit-displayName" name="displayName" value={editFormData.displayName} onChange={handleEditFormChange} className="col-span-3 dark:bg-slate-700" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right col-span-1">البريد</Label>
              <Input id="edit-email" name="email" type="email" value={editFormData.email} onChange={handleEditFormChange} className="col-span-3 dark:bg-slate-700" disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right col-span-1">الهاتف</Label>
              <Input id="edit-phone" name="phone" value={editFormData.phone} onChange={handleEditFormChange} className="col-span-3 dark:bg-slate-700" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right col-span-1">الدور</Label>
              <select 
                id="edit-role" 
                name="role" 
                value={editFormData.role} 
                onChange={handleEditFormChange} 
                className="col-span-3 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loggedInUser?.uid !== SUPER_ADMIN_UID}
              >
                <option value="customer">عميل</option>
                <option value="admin">مدير</option>
              </select>
            </div>
            {loggedInUser?.uid !== SUPER_ADMIN_UID && (
              <p className="col-span-4 text-xs text-slate-500 dark:text-slate-400 text-center">صلاحية تغيير الدور مقتصرة على الأدمن الخارق فقط.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleUpdateUser} disabled={isSubmitting} className="bg-purple-500 hover:bg-purple-600 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>هل أنت متأكد أنك تريد حذف المستخدم <span className="font-semibold">{currentUser?.displayName || currentUser?.email}</span>؟ هذا الإجراء لا يمكن التراجع عنه.</p>
            <p className="text-sm text-red-500 mt-2">ملاحظة: هذا سيحذف بيانات المستخدم من قاعدة البيانات فقط، ولن يحذف حساب المصادقة الخاص به من Firebase Auth تلقائياً.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleDeleteUser} variant="destructive" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} حذف المستخدم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <KeyRound className="mr-2 text-yellow-500" />
              تأكيد إعادة تعيين كلمة المرور
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>هل أنت متأكد أنك تريد إرسال رابط لإعادة تعيين كلمة مرور المستخدم <span className="font-semibold">{currentUser?.displayName || currentUser?.email}</span>؟</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handlePasswordReset} disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} نعم، أرسل الرابط
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UserManagement;
