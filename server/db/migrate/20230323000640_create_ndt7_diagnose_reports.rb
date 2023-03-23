class CreateNdt7DiagnoseReports < ActiveRecord::Migration[6.1]
  def change
    create_table :ndt7_diagnose_reports do |t|
      t.references :client, foreign_key: true
      t.jsonb :report
      t.timestamps
    end
  end
end
