using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace School.Servieces.Models
{
    [DataContract(Name = "student")]
    public class StudentModel
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "fname")]
        public string Fname { get; set; }

        [DataMember(Name = "lname")]
        public string Lname { get; set; }

        [DataMember(Name = "grade")]
        public int Grade { get; set; }

        [DataMember(Name = "age")]
        public int Age { get; set; }

        [DataMember(Name = "marks")]
        public virtual ICollection<MarkModel> Marks { get; set; }

        [DataMember(Name = "fullname")]
        public string FullName
        {
            get
            {
                return string.Format("{0} {1}", this.Fname, this.Lname);
            }
        }

    }
}
