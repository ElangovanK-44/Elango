import { showToast } from './utils.js';
import { supabase } from './supabase.js';
import { initAuth } from './auth.js';

// Check authentication on page load
initAuth();

async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    window.location.href = '/signin.html';
    return null;
  }

  return session.user;
}

async function loadUserProfile() {
  const user = await checkAuth();
  if (!user) return;

  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      showToast('Failed to load profile data', 'error');
      return;
    }

    if (profile) {
      const infoRows = document.querySelectorAll('.profile-info-row');
      if (infoRows[0]) infoRows[0].querySelector('.profile-value').textContent = profile.full_name || 'N/A';
      if (infoRows[1]) infoRows[1].querySelector('.profile-value').textContent = profile.mobile || 'N/A';
      if (infoRows[2]) infoRows[2].querySelector('.profile-value').textContent = profile.email || 'N/A';
      if (infoRows[3]) infoRows[3].querySelector('.profile-value').textContent = profile.alt_mobile || 'Not Provided';

      const statusBadge = document.querySelector('.badge');
      if (statusBadge) {
        statusBadge.className = 'badge';
        switch(profile.kyc_status) {
          case 'approved':
            statusBadge.classList.add('badge-success');
            statusBadge.textContent = 'Approved';
            break;
          case 'rejected':
            statusBadge.classList.add('badge-danger');
            statusBadge.textContent = 'Rejected';
            break;
          default:
            statusBadge.classList.add('badge-warning');
            statusBadge.textContent = 'Pending';
        }
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Failed to load profile data', 'error');
  }
}

const aadhaarInput = document.getElementById('aadhaarUpload');
const panInput = document.getElementById('panUpload');
const submitButton = document.querySelector('button[type="button"]');

let selectedAadhaar = null;
let selectedPan = null;

aadhaarInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedAadhaar = e.target.files[0];
    const fileName = e.target.files[0].name;
    showToast(`Aadhaar file selected: ${fileName}`);
  }
});

panInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedPan = e.target.files[0];
    const fileName = e.target.files[0].name;
    showToast(`PAN file selected: ${fileName}`);
  }
});

async function uploadDocument(file, documentType, userId) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('kyc-documents')
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('kyc-documents')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

async function saveDocumentRecord(userId, documentType, documentUrl) {
  const { error } = await supabase
    .from('kyc_documents')
    .insert([
      {
        user_id: userId,
        document_type: documentType,
        document_url: documentUrl,
        status: 'pending'
      }
    ]);

  if (error) {
    throw error;
  }
}

submitButton.addEventListener('click', async () => {
  if (!selectedAadhaar && !selectedPan) {
    showToast('Please select at least one document to upload', 'error');
    return;
  }

  const user = await checkAuth();
  if (!user) return;

  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  try {
    if (selectedAadhaar) {
      showToast('Uploading Aadhaar document...');
      const aadhaarUrl = await uploadDocument(selectedAadhaar, 'aadhaar', user.id);
      await saveDocumentRecord(user.id, 'aadhaar', aadhaarUrl);
    }

    if (selectedPan) {
      showToast('Uploading PAN document...');
      const panUrl = await uploadDocument(selectedPan, 'pan', user.id);
      await saveDocumentRecord(user.id, 'pan', panUrl);
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ kyc_status: 'pending' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating KYC status:', updateError);
    }

    showToast('Documents uploaded successfully!');

    selectedAadhaar = null;
    selectedPan = null;
    aadhaarInput.value = '';
    panInput.value = '';

    setTimeout(() => {
      loadUserProfile();
    }, 1500);

  } catch (error) {
    console.error('Upload error:', error);
    showToast('Failed to upload documents. Please try again.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-check-circle"></i> Submit KYC Documents';
  }
});

loadUserProfile();