function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="products" element={<AnimatedPage><ProductsPage /></AnimatedPage>} />
              <Route path="products/:productId" element={<AnimatedPage><ProductDetailsPage /></AnimatedPage>} />
              <Route path="cart" element={<AnimatedPage><CartPage /></AnimatedPage>} />
              <Route path="checkout" element={<ProtectedRoute><AnimatedPage><CheckoutPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="order-success" element={<ProtectedRoute><AnimatedPage><OrderSuccessPage /></AnimatedPage></ProtectedRoute>} />
              <Route path="login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
              <Route path="signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
              <Route path="forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
              <Route path="profile" element={<ProtectedRoute><AnimatedPage><UserProfilePage /></AnimatedPage></ProtectedRoute>} />
              <Route path="about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
              <Route path="contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />

              {/* تعديل هنا: حماية admin بهذا الشكل */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="admin" element={<AnimatedPage><AdminDashboardPage /></AnimatedPage>} />
              </Route>

              <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
