export const BACKEND_MESSAGE_KEYS: Record<string, string> = {
  'Bu e-posta adresi zaten kayıtlı': 'errors.api.emailAlreadyRegistered',
  'Bu TC Kimlik No zaten kayıtlı': 'errors.api.nationalIdAlreadyRegistered',
  'E-posta veya şifre hatalı': 'errors.api.invalidCredentials',
  'Kullanıcı bulunamadı': 'errors.api.userNotFound',
  'Hesabınız pasif duruma alınmış': 'errors.api.accountInactive',
  'Hesabınız pasif duruma alınmış, giriş yapamazsınız':
    'errors.api.accountInactiveLogin',
  'Geçmiş tarihe izin talebi girilemez': 'errors.api.pastDateNotAllowed',
  'Yıllık izin bakiyeniz yetersiz': 'errors.api.insufficientBalanceYours',
  'İzin talebi bulunamadı': 'errors.api.leaveRequestNotFound',
  'Bu izin talebini düzenleme yetkiniz yok': 'errors.api.noEditPermission',
  'Sadece bekleyen talepler düzenlenebilir': 'errors.api.onlyPendingEditable',
  'Bu izin talebini silme yetkiniz yok': 'errors.api.noDeletePermission',
  'Sadece bekleyen talepler silinebilir': 'errors.api.onlyPendingDeletable',
  'Yıllık izin bakiyesi yetersiz': 'errors.api.insufficientBalance',
  'Sadece bekleyen talepler reddedilebilir':
    'errors.api.onlyPendingRejectable',
  'Sadece bekleyen talepler onaylanabilir':
    'errors.api.onlyPendingApprovable',
  'Bu tarih aralığında bekleyen veya onaylanmış bir talebiniz zaten var':
    'errors.api.overlappingRequest',
  'Bitiş tarihi başlangıç tarihinden önce olamaz':
    'validation.endBeforeStart',
  'Sadece onaylanmış talepler iptal edilebilir':
    'errors.api.onlyApprovedCancellable',
  'Kendi hesabınızı pasifleştiremezsiniz': 'errors.api.cannotDeactivateSelf',
  'Bu e-posta adresi zaten kullanılıyor': 'errors.api.emailAlreadyInUse',
  'Mevcut şifre hatalı': 'errors.api.currentPasswordIncorrect',
  'Geçerli bir e-posta adresi girin': 'validation.invalidEmail',
  'Şifre boş bırakılamaz': 'errors.api.passwordRequired',
  'Ad boş bırakılamaz': 'errors.api.firstNameRequired',
  'Soyad boş bırakılamaz': 'errors.api.lastNameRequired',
  'TC Kimlik No 11 haneli olmalı': 'validation.nationalIdLength',
  'Telefon boş bırakılamaz': 'errors.api.phoneRequired',
  'Geçerli bir departman seçin': 'errors.api.invalidDepartment',
  'Geçerli bir pozisyon seçin': 'errors.api.invalidPosition',
  'İşe başlama tarihi geçerli bir tarih olmalı':
    'errors.api.invalidStartDate',
  'Doğum tarihi geçerli bir tarih olmalı': 'errors.api.invalidBirthDate',
  'Şifre en az 6 karakter olmalı': 'validation.minPasswordLength',
  'İzin türü GUNLUK veya YILLIK olmalı': 'errors.api.invalidLeaveType',
  'Başlangıç tarihi geçerli bir tarih olmalı':
    'errors.api.invalidLeaveStartDate',
  'Bitiş tarihi geçerli bir tarih olmalı': 'errors.api.invalidLeaveEndDate',
  'Geçerli bir rol seçin': 'errors.api.invalidRole',
  'Yıllık izin bakiyesi tam sayı olmalı': 'errors.api.balanceMustBeInteger',
  'Yıllık izin bakiyesi negatif olamaz': 'errors.api.balanceCannotBeNegative',
  'Mevcut şifre boş bırakılamaz': 'errors.api.currentPasswordRequired',
  'Yeni şifre en az 6 karakter olmalı': 'errors.api.newPasswordTooShort',
};
