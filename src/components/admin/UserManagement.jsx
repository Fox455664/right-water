// src/components/admin/UserManagement.jsx

// ... داخل دالة .map() ...
<TableCell className="text-center px-3 py-4">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {/* Edit button still uses state, which is fine for forms */}
      <DropdownMenuItem onClick={() => handleEditUser(user)}>
        <Edit2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> تعديل
      </DropdownMenuItem>
      
      {/* 🔥🔥 هذا هو الكود المُصحح لإعادة التعيين 🔥🔥 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCurrentUser(user); }}>
            <KeyRound className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> إعادة تعيين كلمة المرور
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>إعادة تعيين كلمة المرور</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد إرسال رابط إعادة تعيين كلمة المرور إلى "{currentUser?.email}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordReset} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "إرسال"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 🔥🔥 وهذا هو الكود المُصحح للحذف 🔥🔥 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCurrentUser(user); }} className="text-red-600 focus:text-red-600 dark:focus:text-red-400">
            <Trash2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> حذف
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                <AlertDialogDescription>
                    هل أنت متأكد أنك تريد حذف المستخدم "{currentUser?.displayName}"؟ هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                    {isSubmitting ? <Loader2 className="animate-spin"/> : "نعم، قم بالحذف"}
                </Button>
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
