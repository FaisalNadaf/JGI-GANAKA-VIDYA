/**
 * Schema reference for collections used by this portal.
 * (We use the native MongoDB driver, so these are just documentation
 *  for what shape the collections have. No runtime validation.)
 *
 * EXISTING (read-only — owned by the Python student-app backend):
 *   users        : student accounts
 *   courses      : course catalog (titles localized en/hi/kn/mr)
 *   tests        : weekly tests + AI-generated tests
 *   institutes   : partnered offline institutes
 *
 * NEW (created and managed by THIS portal):
 *   institute_admins : login accounts for institute staff
 *   workshops        : mentorship sessions / seminars / workshops
 *   schools          : local schools & colleges
 *
 * --------------------------------------------------------------------
 *
 * institute_admins:
 *   _id           ObjectId
 *   name          string
 *   email         string (unique, lowercase)
 *   password      string (bcrypt hash)
 *   role          string ("admin" | "viewer")
 *   institute_id  string  | null  (links to institutes._id)
 *   institute_name string                       (denormalised for display)
 *   created_at    Date
 *
 * workshops:
 *   _id              ObjectId
 *   title            string
 *   description      string
 *   type             string ("workshop" | "seminar" | "mentorship")
 *   date             Date (when the event happens)
 *   location         string (free-form: school/college/online)
 *   school_id        string | null  (links to schools._id when applicable)
 *   target_grades    string[]  (e.g. ["Class 10", "PUC-1"])
 *   target_courses   string[]  (course IDs for filtering invitees)
 *   invited_students string[]  (user IDs) — populated when "invite" action runs
 *   created_by       string    (institute_admins._id)
 *   institute_id     string    (denormalised for fast filtering)
 *   created_at       Date
 *
 * schools:
 *   _id          ObjectId
 *   name         string
 *   type         string ("school" | "college")
 *   city         string
 *   state        string
 *   contact_name string
 *   contact_phone string
 *   contact_email string
 *   notes        string
 *   created_at   Date
 */
module.exports = {};
