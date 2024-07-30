WickedPdf.config = {
  temp_path: Rails.root.join('tmp'),
  delete_temporary_files: true,
  exe_path: Rails.env.production? || Rails.env.staging? ? "/usr/bin/wkhtmltopdf" : nil
}
