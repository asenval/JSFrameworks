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
    public class StudentDetail: StudentModel
    {
        [DataMember(Name = "marks")]
        public virtual ICollection<MarkModel> Marks { get; set; }        
    }
}
